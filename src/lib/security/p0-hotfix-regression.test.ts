import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("security_p0_hotfix_regression", () => {
  it("keeps_core_saju_tables_protected_by_rls_and_owner_policies", () => {
    const migrations = [
      "supabase/migrations/202606300010_core_saju_schema.sql",
      "supabase/migrations/202606300030_disable_core_saju_rls.sql",
      "supabase/migrations/202607010010_p0_security_hotfix.sql",
    ].map(readProjectFile).join("\n");

    expect(migrations).not.toContain("disable row level security");
    expect(migrations).toContain("alter table public.saju_readings enable row level security");
    expect(migrations).toContain("alter table public.saju_chat_messages enable row level security");
    expect(migrations).toContain("alter table public.saju_compatibilities enable row level security");
    expect(migrations).toContain("auth.uid() = user_id");
    expect(migrations).toContain("auth.uid() = public.saju_reading_owner_id(reading_id)");
  });

  it("filters_every_sensitive_reading_route_by_authenticated_owner", () => {
    const files = [
      "src/app/api/saju/preview/route.ts",
      "src/app/api/saju/analyze/route.ts",
      "src/app/api/saju/chat/route.ts",
      "src/app/api/saju/pdf/[id]/route.ts",
      "src/app/[locale]/reading/[id]/page.tsx",
    ];

    for (const file of files) {
      const content = readProjectFile(file);
      expect(content, `${file} should require an authenticated user`).toContain(
        "supabase.auth.getUser()",
      );
      expect(content, `${file} should bind reading lookup to user.id`).toContain(
        '.eq("user_id", user.id)',
      );
    }
  });

  it("filters_compatibility_routes_and_actions_by_owner", () => {
    const compatibilityRoute = readProjectFile("src/app/api/saju/compatibility/route.ts");
    const actions = readProjectFile("src/services/saju/actions.ts");
    const chatActions = readProjectFile("src/services/saju/chat-actions.ts");

    expect(compatibilityRoute).toContain('.eq("user_id", user.id)');
    expect(actions).toContain('.eq("user_id", user.id)');
    expect(chatActions).toContain('.eq("user_id", user.id)');
    expect(chatActions).toContain("권한이 없습니다.");
  });

  it("deducts_stars_with_server_policy_and_atomic_rpc_only", () => {
    const route = readProjectFile("src/app/api/saju/deduct-stars/route.ts");
    const migration = readProjectFile("supabase/migrations/202607010010_p0_security_hotfix.sql");

    expect(route).toContain("REPORT_STAR_COST");
    expect(route).toContain('amount: -REPORT_STAR_COST');
    expect(route).toContain('rpc("deduct_stars_for_report"');
    expect(route).not.toContain("newBalance = stars.balance - amount");
    expect(route).not.toContain("const { userId, amount");
    expect(migration).toContain("create or replace function public.deduct_stars_for_report");
    expect(migration).toContain("for update");
    expect(migration).toContain("raise exception 'INSUFFICIENT_STARS'");
  });

  it("keeps_sensitive_star_rpcs_service_role_only_and_owner_guarded", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607010020_rpc_suggestions_security.sql",
    );
    const chatRoute = readProjectFile("src/app/api/saju/chat/route.ts");
    const deductRoute = readProjectFile("src/app/api/saju/deduct-stars/route.ts");

    expect(migration).toContain(
      "revoke execute on function public.decrement_star(uuid) from authenticated",
    );
    expect(migration).toContain(
      "revoke execute on function public.deduct_stars_for_report(uuid, uuid) from authenticated",
    );
    expect(migration).toContain(
      "revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.decrement_star(uuid) to service_role",
    );
    expect(migration).toContain(
      "grant execute on function public.deduct_stars_for_report(uuid, uuid) to service_role",
    );
    expect(migration).toContain("auth.uid() <> p_user_id");
    expect(migration).toContain("from public.saju_readings");
    expect(migration).toContain("user_id = p_user_id");
    expect(migration).toContain("raise exception 'FORBIDDEN'");
    expect(chatRoute).toContain("createAdminClient");
    expect(deductRoute).toContain("createAdminClient");
  });

  it("credits_paddle_webhooks_from_paid_price_id_and_idempotency_key", () => {
    const route = readProjectFile("src/app/api/webhooks/paddle/route.ts");
    const helper = readProjectFile("src/lib/paddle/credit-grant.ts");
    const migration = readProjectFile("supabase/migrations/202607010010_p0_security_hotfix.sql");

    expect(route).toContain("resolvePaddleCreditGrant");
    expect(helper).toContain("item?.price.id");
    expect(route).not.toContain("CREDIT_MAP");
    expect(route).not.toContain("event.data.custom_data || {}");
    expect(route).not.toContain("productType } = event.data.custom_data");
    expect(route).toContain("credit_stars_for_paddle_purchase");
    expect(route).toContain("p_transaction_id");
    expect(route).toContain("Duplicate transaction ignored");
    expect(migration).toContain("create unique index if not exists star_transactions_paddle_transaction_id_key");
    expect(migration).toContain("on public.star_transactions(paddle_transaction_id)");
    expect(migration).toContain("create or replace function public.credit_stars_for_paddle_purchase");
    expect(migration).toContain("when unique_violation then");
  });
});
