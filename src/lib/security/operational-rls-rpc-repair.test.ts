import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("operational_rls_rpc_repair", () => {
  it("enables_rls_and_recreates_owner_policies_for_core_saju_tables", () => {
    const migration = readProjectFile(
      "supabase/migrations/20260707060209_operational_rls_rpc_security_repair.sql",
    );

    expect(migration).toContain("alter table if exists public.saju_readings enable row level security");
    expect(migration).toContain("alter table if exists public.saju_chat_messages enable row level security");
    expect(migration).toContain("alter table if exists public.saju_compatibilities enable row level security");
    expect(migration).toContain("Users can read own saju readings");
    expect(migration).toContain("Users can insert own chat messages");
    expect(migration).toContain("Users can insert own compatibilities");
    expect(migration).toContain("(select auth.uid()) = user_id");
  });

  it("keeps_sensitive_star_rpcs_service_role_only", () => {
    const migration = readProjectFile(
      "supabase/migrations/20260707060209_operational_rls_rpc_security_repair.sql",
    );

    expect(migration).toContain("create or replace function public.credit_stars_for_paddle_purchase");
    expect(migration).toContain("revoke execute on function public.decrement_star(uuid) from anon");
    expect(migration).toContain("revoke execute on function public.decrement_star(uuid) from authenticated");
    expect(migration).toContain(
      "revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from authenticated",
    );
    expect(migration).toContain("grant execute on function public.decrement_star(uuid) to service_role");
    expect(migration).toContain(
      "grant execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) to service_role",
    );
  });

  it("locks_direct_star_writes_and_adds_chat_reservation_refund_rpcs", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607210010_release_gate_star_reservation_rate_limit.sql",
    );

    expect(migration).toContain("drop policy if exists \"Users can insert own stars\" on public.user_stars");
    expect(migration).toContain("drop policy if exists \"Users can update own stars\" on public.user_stars");
    expect(migration).toContain("drop policy if exists \"Users can insert own star transactions\" on public.star_transactions");
    expect(migration).toContain("create or replace function public.reserve_chat_star");
    expect(migration).toContain("create or replace function public.refund_chat_star");
    expect(migration).toContain("for update");
    expect(migration).toContain("insert into public.star_transactions");
    expect(migration).toContain("chat_refund");
    expect(migration).toContain("revoke execute on function public.reserve_chat_star(uuid) from authenticated");
    expect(migration).toContain("grant execute on function public.reserve_chat_star(uuid) to service_role");
    expect(migration).toContain("revoke execute on function public.refund_chat_star(uuid, text, uuid) from authenticated");
    expect(migration).toContain("grant execute on function public.refund_chat_star(uuid, text, uuid) to service_role");
  });

  it("adds_supabase_rpc_backed_rate_limit_storage", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607210010_release_gate_star_reservation_rate_limit.sql",
    );

    expect(migration).toContain("create table if not exists public.rate_limits");
    expect(migration).toContain("create or replace function public.check_rate_limit");
    expect(migration).toContain("p_window_seconds");
    expect(migration).toContain("for update");
    expect(migration).toContain("grant execute on function public.check_rate_limit(text, integer, integer) to service_role");
  });
});
