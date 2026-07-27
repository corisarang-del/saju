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

  it("uses_the_shared_initial_prompt_source_instead_of_stale_inline_prompts", () => {
    const script = readProjectFile("scripts/qa-live-api-check.mjs");
    const sharedPrompts = readProjectFile("src/lib/saju/initial-analysis-prompts.mjs");

    expect(script).toContain('from "../src/lib/saju/initial-analysis-prompts.mjs"');
    expect(script).not.toContain("내 사주를 바탕으로 지금 관계운과 연애에서 조심할 점");
    expect(sharedPrompts).toContain("내 정보와 상대방 정보를 함께 바탕으로");
  });
});
