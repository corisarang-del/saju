import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("release_gate_regression", () => {
  it("blocks_public_paid_status_updates_from_client_owned_route", () => {
    const route = readProjectFile("src/app/api/saju/update-status/route.ts");

    expect(route).toContain("isClientAllowedReadingStatus");
    expect(route).toContain("isPrivilegedReadingStatus");
    expect(route).toContain("status: 403");
    expect(route).toContain(".select('id')");
    expect(route).toContain(".maybeSingle()");
    expect(route).toContain("if (!updatedReading)");
    expect(route).toContain("Reading not found");
    expect(route).not.toContain(".update({ status, updated_at:");
  });

  it("marks_report_paid_only_inside_atomic_star_deduction_rpc", () => {
    const migration = readProjectFile(
      "supabase/migrations/202607030010_report_payment_status_hardening.sql",
    );
    const deductRoute = readProjectFile("src/app/api/saju/deduct-stars/route.ts");
    const reportClient = readProjectFile("src/components/saju/report/SajuReportClient.tsx");

    expect(migration).toContain("for update");
    expect(migration).toContain("REPORT_ALREADY_PAID");
    expect(migration).toContain("update public.saju_readings");
    expect(migration).toContain("set status = 'paid'");
    expect(deductRoute).not.toContain("const { userId");
    expect(reportClient).not.toContain("/api/saju/update-status");
    expect(reportClient).not.toContain("status: 'paid'");
  });

  it("shows_the_same_report_star_cost_that_the_server_charges", () => {
    const reportClient = readProjectFile("src/components/saju/report/SajuReportClient.tsx");

    expect(reportClient).toContain("REPORT_STAR_COST");
    expect(reportClient).not.toContain("const REPORT_COST = 10");
  });

  it("rate_limits_and_locks_chat_generation_before_calling_ai_provider", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");
    const migration = readProjectFile(
      "supabase/migrations/202607240030_chat_generation_persistent_lock.sql",
    );

    const rateLimitIndex = route.indexOf("await checkRateLimit");
    const localLockIndex = route.indexOf("if (!acquireChatGenerationLock");
    const persistentLockIndex = route.indexOf("await acquirePersistentChatGenerationLock");
    const streamTextIndex = route.indexOf("streamText({");

    expect(route).toContain("getClientIp");
    expect(route).toContain("CHAT_DAILY_LIMIT");
    expect(route).toContain("acquirePersistentChatGenerationLock");
    expect(route).toContain("releasePersistentChatGenerationLock");
    expect(route).toContain("releaseChatGenerationLock");
    expect(route).toContain("status: 409");
    expect(route).toContain("status: 429");
    expect(migration).toContain("create table if not exists public.chat_generation_locks");
    expect(migration).toContain("create or replace function public.acquire_chat_generation_lock");
    expect(migration).toContain("create or replace function public.release_chat_generation_lock");
    expect(rateLimitIndex).toBeGreaterThan(-1);
    expect(localLockIndex).toBeGreaterThan(rateLimitIndex);
    expect(persistentLockIndex).toBeGreaterThan(localLockIndex);
    expect(streamTextIndex).toBeGreaterThan(persistentLockIndex);
  });

  it("reserves_chat_star_before_ai_and_refunds_on_generation_or_persistence_failure", () => {
    const route = readProjectFile("src/app/api/saju/chat/route.ts");

    const reserveIndex = route.indexOf("reserve_chat_star");
    const initialAnalysisIndex = route.indexOf("generateValidatedInitialAnalysis({");
    const streamTextIndex = route.indexOf("streamText({");

    expect(route).toContain("reserveChatStar");
    expect(route).toContain("refundReservedChatStar");
    expect(route).toContain("refund_chat_star");
    expect(route).toContain("Initial analysis persistence failed");
    expect(route).toContain("incomplete assistant response skipped");
    expect(route).not.toContain("decrement_star");
    expect(reserveIndex).toBeGreaterThan(-1);
    expect(initialAnalysisIndex).toBeGreaterThan(reserveIndex);
    expect(streamTextIndex).toBeGreaterThan(reserveIndex);
  });

  it("uses_shared_supabase_rate_limit_backend_for_production_ai_cost_routes", () => {
    const rateLimit = readProjectFile("src/lib/rate-limit.ts");
    const chatRoute = readProjectFile("src/app/api/saju/chat/route.ts");
    const suggestionsRoute = readProjectFile("src/app/api/saju/suggestions/route.ts");

    expect(rateLimit).toContain("RATE_LIMIT_SHARED_BACKEND_REQUIRED");
    expect(rateLimit).toContain("check_rate_limit");
    expect(rateLimit).toContain("createAdminClient");
    expect(chatRoute).toContain("await checkRateLimit");
    expect(suggestionsRoute).toContain("await checkRateLimit");
  });

  it("requires_release_gate_script_with_paddle_env_audit_and_build_checks", () => {
    const packageJson = readProjectFile("package.json");
    const scripts = JSON.parse(packageJson).scripts as Record<string, string>;

    expect(scripts["release:gate:code"]).toContain("pnpm test:env");
    expect(scripts["release:gate:code"]).toContain("pnpm audit --prod");
    expect(scripts["release:gate:code"]).not.toContain("REQUIRE_PADDLE_ENV=true");
    expect(scripts["release:gate"]).toContain("pnpm release:gate:code");
    expect(scripts["release:gate"]).toContain("REQUIRE_PRODUCTION_ENV=true pnpm test:env");
    expect(scripts["release:gate"]).toContain("pnpm qa:live-api:free");
    expect(scripts["release:gate"]).toContain("pnpm qa:live-api");
    expect(scripts["release:gate:payments"]).toContain(
      "REQUIRE_PRODUCTION_ENV=true REQUIRE_PADDLE_ENV=true pnpm test:env",
    );
    expect(scripts["release:gate:payments"]).toContain("pnpm audit --prod");
    expect(scripts["qa:paddle-webhook:signed"]).toBe(
      "node scripts/qa-paddle-webhook-check.mjs",
    );
    expect(scripts["release:gate:payments:live"]).toContain("pnpm release:gate:payments");
    expect(scripts["release:gate:payments:live"]).toContain("pnpm qa:paddle-webhook:signed");
  });

  it("pins_next_to_a_release_without_known_high_production_advisories", () => {
    const packageJson = readProjectFile("package.json");

    expect(packageJson).toContain("\"next\": \"^16.2.11\"");
  });

  it("keeps_report_analysis_generation_recoverable_after_provider_failure", () => {
    const route = readProjectFile("src/app/api/saju/analyze/route.ts");

    expect(route).toContain("let readingIdForFailure");
    expect(route).toContain("let userIdForFailure");
    expect(route).toContain(".eq('status', 'paid')");
    expect(route).toContain("status: 409");
    expect(route).toContain("status: 'failed'");
    expect(route).not.toContain("req.clone().json()");
  });
});
