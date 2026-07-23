import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("admin_audit_regression", () => {
  it("creates_admin_audit_logs_and_atomic_star_adjustment_rpc", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607100010_admin_star_adjustment_audit.sql",
    );

    expect(migration).toContain("create table if not exists public.admin_audit_logs");
    expect(migration).toContain("actor_user_id uuid not null references auth.users(id)");
    expect(migration).toContain("target_user_id uuid not null references auth.users(id)");
    expect(migration).toContain("reason text not null");
    expect(migration).toContain("ip_address text null");
    expect(migration).toContain("user_agent text null");
    expect(migration).toContain("alter table public.admin_audit_logs enable row level security");
    expect(migration).toContain("create or replace function public.admin_adjust_user_stars");
    expect(migration).toContain("for update");
    expect(migration).toContain("insert into public.star_transactions");
    expect(migration).toContain("insert into public.admin_audit_logs");
    expect(migration).toContain("revoke execute on function public.admin_adjust_user_stars");
    expect(migration).toContain("grant execute on function public.admin_adjust_user_stars");
  });

  it("requires_admin_reason_and_request_metadata_for_manual_star_adjustments", () => {
    const service = readProjectFile("src/services/admin/stars.ts");
    const page = readProjectFile("src/app/[locale]/admin/page.tsx");

    expect(service).toContain("headers");
    expect(service).toContain("reason");
    expect(service).toContain("p_actor_user_id");
    expect(service).toContain("p_actor_email");
    expect(service).toContain("p_reason");
    expect(service).toContain("p_ip_address");
    expect(service).toContain("p_user_agent");
    expect(service).toContain(".rpc(\"admin_adjust_user_stars\"");
    expect(page).toContain('name="reason"');
    expect(page).toContain("조정 사유");
  });
});
