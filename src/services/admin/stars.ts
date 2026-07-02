"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateStarBalance, getAdjustmentLabel, parseStarAdjustmentMode, parseStarAmount, toTransactionAmount } from "@/lib/admin/star-adjustment";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/adminGuard";

export interface AdminStarTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  productType: string | null;
  createdAt: string;
}

export interface AdminStarUserProfile {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  balance: number;
  transactions: AdminStarTransaction[];
}

interface AuthUserSummary {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
}

interface StarBalanceRow {
  balance: number | null;
}

interface StarTransactionRow {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  product_type: string | null;
  created_at: string;
}

async function findUserByEmail(email: string): Promise<AuthUserSummary | null> {
  const supabase = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) {
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      };
    }

    if (data.users.length < 1000) {
      break;
    }
  }

  return null;
}

export async function getAdminStarUserProfile(email: string): Promise<AdminStarUserProfile | null> {
  await requireAdmin();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user?.email) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: stars, error: starsError } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle<StarBalanceRow>();

  if (starsError) {
    throw new Error(starsError.message);
  }

  const { data: transactions, error: transactionError } = await supabase
    .from("star_transactions")
    .select("id, amount, balance_after, type, product_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<StarTransactionRow[]>();

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    balance: Number(stars?.balance ?? 0),
    transactions: (transactions ?? []).map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      balanceAfter: transaction.balance_after,
      type: transaction.type,
      productType: transaction.product_type,
      createdAt: transaction.created_at,
    })),
  };
}

export async function adjustUserStars(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = String(formData.get("locale") ?? "ko");
  const mode = parseStarAdjustmentMode(formData.get("mode"));
  const amount = parseStarAmount(formData.get("amount"));

  if (!email) {
    redirect(`/${locale}/admin?status=missing-email`);
  }

  const user = await findUserByEmail(email);
  if (!user?.email) {
    redirect(`/${locale}/admin?email=${encodeURIComponent(email)}&status=user-not-found`);
  }

  const supabase = createAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle<StarBalanceRow>();

  if (selectError) {
    throw new Error(selectError.message);
  }

  const currentBalance = Number(existing?.balance ?? 0);
  let nextBalance: number;

  try {
    nextBalance = calculateStarBalance({ currentBalance, amount, mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "별 조정에 실패했어";
    redirect(
      `/${locale}/admin?email=${encodeURIComponent(email)}&status=error&message=${encodeURIComponent(message)}`,
    );
  }

  if (existing) {
    const { error } = await supabase
      .from("user_stars")
      .update({ balance: nextBalance })
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("user_stars")
      .insert({ user_id: user.id, balance: nextBalance });

    if (error) {
      throw new Error(error.message);
    }
  }

  const { error: transactionError } = await supabase.from("star_transactions").insert({
    user_id: user.id,
    amount: toTransactionAmount({ mode, amount }),
    balance_after: nextBalance,
    type: `admin_${mode}`,
    product_type: `admin_${getAdjustmentLabel(mode)}`,
  });

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  revalidatePath(`/${locale}/admin`);
  redirect(
    `/${locale}/admin?email=${encodeURIComponent(email)}&status=${mode}&balance=${nextBalance}`,
  );
}
