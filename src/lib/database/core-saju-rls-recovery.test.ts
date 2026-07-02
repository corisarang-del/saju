import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/202606300030_disable_core_saju_rls.sql",
);

describe("core_saju_rls_recovery", () => {
  it("keeps_core_saju_rls_enabled_for_private_birth_data", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("alter table public.saju_readings enable row level security");
    expect(sql).toContain("alter table public.saju_chat_messages enable row level security");
    expect(sql).toContain("alter table public.saju_compatibilities enable row level security");
    expect(sql).not.toContain("disable row level security");
    expect(sql).toContain("notify pgrst, 'reload schema'");
  });
});
