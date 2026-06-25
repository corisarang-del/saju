import { describe, expect, it } from "vitest";
import { isSupabaseConfigured } from "./config";

describe("supabase_config", () => {
  it("rejects_placeholder_values_when_env_file_is_not_filled", () => {
    expect(isSupabaseConfigured("your_supabase_url", "your_supabase_anon_key")).toBe(false);
    expect(
      isSupabaseConfigured(
        "https://your-project-id.supabase.co",
        "your_supabase_anon_key",
      ),
    ).toBe(false);
  });

  it("accepts_real_project_url_and_anon_key_when_values_are_present", () => {
    expect(
      isSupabaseConfigured(
        "https://abcdefghijklmnopqrst.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
      ),
    ).toBe(true);
  });
});

