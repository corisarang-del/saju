import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("membership_admin_regression", () => {
  it("creates_user_memberships_with_rls_and_unique_provider_subscription", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607070900_user_memberships_and_chat_transaction_log.sql",
    );

    expect(migration).toContain("create table if not exists public.user_memberships");
    expect(migration).toContain("subscription_id text not null");
    expect(migration).toContain("unique(provider, subscription_id)");
    expect(migration).toContain("alter table public.user_memberships enable row level security");
    expect(migration).toContain("auth.uid() = user_id");
  });

  it("handles_paddle_subscription_events_and_upserts_membership_state", () => {
    const route = readProjectFile("src/app/api/webhooks/paddle/route.ts");

    expect(route).toContain("resolvePaddleMembershipUpdate");
    expect(route).toContain("subscription.activated");
    expect(route).toContain("subscription.updated");
    expect(route).toContain("subscription.canceled");
    expect(route).toContain(".from('user_memberships')");
    expect(route).toContain("onConflict: 'provider,subscription_id'");
  });

  it("shows_membership_snapshot_and_latest_deduction_on_admin_profile", () => {
    const service = readProjectFile("src/services/admin/stars.ts");
    const page = readProjectFile("src/app/[locale]/admin/page.tsx");

    expect(service).toContain("membershipStatus");
    expect(service).toContain("latestDeductionType");
    expect(service).toContain("latestSnapshotCreatedAt");
    expect(service).toContain(".from(\"user_memberships\")");
    expect(service).toContain(".from(\"coaching_snapshots\")");
    expect(page).toContain("멤버십");
    expect(page).toContain("최근 차감");
    expect(page).toContain("최근 스냅샷");
  });

  it("logs_chat_star_deductions_as_star_transactions", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607070900_user_memberships_and_chat_transaction_log.sql",
    );

    expect(migration).toContain("create or replace function public.decrement_star");
    expect(migration).toContain("insert into public.star_transactions");
    expect(migration).toContain("'chat_message'");
  });
});
