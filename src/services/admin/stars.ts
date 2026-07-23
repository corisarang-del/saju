"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseStarAdjustmentMode, parseStarAdjustmentReason, parseStarAmount } from "@/lib/admin/star-adjustment";
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
  membershipStatus: string | null;
  membershipCurrentPeriodEnd: string | null;
  membershipCanceledAt: string | null;
  latestDeductionType: string | null;
  latestSnapshotCreatedAt: string | null;
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

interface MembershipRow {
  status: string;
  current_period_end: string | null;
  canceled_at: string | null;
}

interface SnapshotRow {
  created_at: string;
}

interface AdminAdjustStarsResult {
  balance_after: number;
}

function getRequestIp(requestHeaders: Headers): string | null {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return requestHeaders.get("x-real-ip")?.trim() || null;
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

  const { data: membership, error: membershipError } = await supabase
    .from("user_memberships")
    .select("status, current_period_end, canceled_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<MembershipRow>();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { data: latestDeduction, error: deductionError } = await supabase
    .from("star_transactions")
    .select("type, product_type")
    .eq("user_id", user.id)
    .lt("amount", 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Pick<StarTransactionRow, "type" | "product_type">>();

  if (deductionError) {
    throw new Error(deductionError.message);
  }

  const { data: latestSnapshot, error: snapshotError } = await supabase
    .from("coaching_snapshots")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SnapshotRow>();

  if (snapshotError) {
    throw new Error(snapshotError.message);
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    balance: Number(stars?.balance ?? 0),
    membershipStatus: membership?.status ?? null,
    membershipCurrentPeriodEnd: membership?.current_period_end ?? null,
    membershipCanceledAt: membership?.canceled_at ?? null,
    latestDeductionType: latestDeduction?.product_type ?? latestDeduction?.type ?? null,
    latestSnapshotCreatedAt: latestSnapshot?.created_at ?? null,
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
  const admin = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = String(formData.get("locale") ?? "ko");
  let mode: ReturnType<typeof parseStarAdjustmentMode>;
  let amount: number;
  let reason: string;

  try {
    mode = parseStarAdjustmentMode(formData.get("mode"));
    amount = parseStarAmount(formData.get("amount"));
    reason = parseStarAdjustmentReason(formData.get("reason"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "별 조정 입력값이 올바르지 않아";
    redirect(
      `/${locale}/admin?email=${encodeURIComponent(email)}&status=error&message=${encodeURIComponent(message)}`,
    );
  }

  if (!email) {
    redirect(`/${locale}/admin?status=missing-email`);
  }

  const user = await findUserByEmail(email);
  if (!user?.email) {
    redirect(`/${locale}/admin?email=${encodeURIComponent(email)}&status=user-not-found`);
  }

  const supabase = createAdminClient();
  const requestHeaders = await headers();
  const { data, error } = await supabase
    .rpc("admin_adjust_user_stars", {
      p_target_user_id: user.id,
      p_actor_user_id: admin.id,
      p_actor_email: admin.email,
      p_amount: amount,
      p_mode: mode,
      p_reason: reason,
      p_ip_address: getRequestIp(requestHeaders),
      p_user_agent: requestHeaders.get("user-agent") ?? null,
    });

  if (error) {
    redirect(
      `/${locale}/admin?email=${encodeURIComponent(email)}&status=error&message=${encodeURIComponent(error.message)}`,
    );
  }

  const rows = data as AdminAdjustStarsResult[] | AdminAdjustStarsResult | null;
  const result = Array.isArray(rows) ? rows[0] : rows;
  const nextBalance = Number(result?.balance_after ?? 0);

  revalidatePath(`/${locale}/admin`);
  redirect(
    `/${locale}/admin?email=${encodeURIComponent(email)}&status=${mode}&balance=${nextBalance}`,
  );
}
