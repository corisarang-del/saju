import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("suggestions_route_security", () => {
  it("requires_authentication_before_calling_gemini", () => {
    const route = readProjectFile("src/app/api/saju/suggestions/route.ts");

    const authIndex = route.indexOf("supabase.auth.getUser()");
    const unauthorizedIndex = route.indexOf("status: 401");
    const generateTextIndex = route.indexOf("generateText({");

    expect(route).toContain("createClient");
    expect(authIndex).toBeGreaterThan(-1);
    expect(unauthorizedIndex).toBeGreaterThan(authIndex);
    expect(generateTextIndex).toBeGreaterThan(unauthorizedIndex);
  });

  it("rate_limits_and_daily_quotas_before_calling_gemini", () => {
    const route = readProjectFile("src/app/api/saju/suggestions/route.ts");

    const rateLimitIndex = route.indexOf("checkRateLimit");
    const quotaIndex = route.indexOf("SUGGESTIONS_DAILY_LIMIT");
    const generateTextIndex = route.indexOf("generateText({");

    expect(route).toContain("getClientIp");
    expect(route).toContain("status: 429");
    expect(route).toContain("요청이 많아서 추천 질문 생성을 잠시 쉬고 있어");
    expect(route).toContain("[saju/suggestions] quota exceeded");
    expect(rateLimitIndex).toBeGreaterThan(-1);
    expect(quotaIndex).toBeGreaterThan(-1);
    expect(generateTextIndex).toBeGreaterThan(rateLimitIndex);
    expect(generateTextIndex).toBeGreaterThan(quotaIndex);
  });

  it("returns_a_safe_message_when_gemini_suggestions_fail", () => {
    const route = readProjectFile("src/app/api/saju/suggestions/route.ts");

    expect(route).toContain("catch (error)");
    expect(route).toContain("[saju/suggestions] generation failed");
    expect(route).toContain("추천 질문을 만들지 못했어. 잠시 후 다시 시도해줘.");
    expect(route).toContain("status: 503");
  });
});
