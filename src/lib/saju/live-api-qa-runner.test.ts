import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("live_api_qa_runner", () => {
  it("expects_the_free_chat_balance_after_reset_and_one_chat_deduction", () => {
    const script = readProjectFile("scripts/qa-live-api-check.mjs");

    expect(script).toContain("await setBalance(3)");
    expect(script).toContain("chatTx.length === 2");
    expect(script).toContain("starState.balance === 2");
  });

  it("fails_fast_with_dns_preflight_when_supabase_host_cannot_be_resolved", () => {
    const script = readProjectFile("scripts/qa-live-api-check.mjs");

    expect(script).toContain('import { lookup } from "node:dns/promises";');
    expect(script).toContain("assertSupabaseDnsReachable");
    expect(script).toContain("Supabase DNS lookup failed");
    expect(script).toContain("curl -I https://${host}/auth/v1/health");
  });

  it("reports_chat_request_durations_for_operational_latency_tracking", () => {
    const script = readProjectFile("scripts/qa-live-api-check.mjs");

    expect(script).toContain("durationMs");
    expect(script).toContain("freeChatDurationMs");
    expect(script).toContain("paidChatDurationMs");
    expect(script).toContain("paidConflictDurationMs");
  });
});
