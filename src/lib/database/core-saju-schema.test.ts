import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/202606300010_core_saju_schema.sql",
);

describe("core_saju_schema", () => {
  it("defines_saju_readings_schema_when_app_queries_core_saju_data", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create table if not exists public.saju_readings");
    expect(sql).toContain("create table if not exists public.saju_chat_messages");
    expect(sql).toContain("create table if not exists public.saju_compatibilities");
    expect(sql).toContain("create or replace view public.saju_compatibility");
    expect(sql).toContain("birth_year integer not null");
    expect(sql).toContain("four_pillars jsonb");
    expect(sql).toContain("five_elements jsonb");
    expect(sql).toContain("preview_summary text");
    expect(sql).toContain("full_analysis jsonb");
    expect(sql).toContain("chat_credits integer not null default 3");
    expect(sql).toContain("chat_used integer not null default 0");
  });

  it("does_not_include_table_qualified_policy_references", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).not.toContain("saju_chat_messages.reading_id");
    expect(sql).not.toContain("saju_compatibilities.reading_id");
  });

  it("keeps_bootstrap_schema_free_of_policy_ddl_that_can_block_table_creation", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).not.toMatch(/create policy/i);
    expect(sql).not.toMatch(/drop policy/i);
    expect(sql).not.toMatch(/with check/i);
    expect(sql).not.toContain("disable row level security");
    expect(sql).toContain("enable row level security");
  });
});
