import { NextResponse } from "next/server";
import { MONTHLY_REPORT_STAR_COST } from "@/lib/monthly-saju/pricing";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.rpc("deduct_stars_for_monthly_report", {
    p_user_id: user.id,
  });

  if (error || !data) {
    const message = error?.message ?? "";
    if (message.includes("INSUFFICIENT_STARS")) {
      return NextResponse.json({ error: "Insufficient stars" }, { status: 402 });
    }

    return NextResponse.json({ error: "Failed to deduct stars" }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result.balance_after !== "number") {
    return NextResponse.json({ error: "Failed to deduct stars" }, { status: 500 });
  }

  return NextResponse.json({
    balance: result.balance_after,
    amount: result.already_unlocked ? 0 : -MONTHLY_REPORT_STAR_COST,
    alreadyUnlocked: Boolean(result.already_unlocked),
  });
}
