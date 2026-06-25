import { describe, expect, it } from "vitest";
import {
  buildAuthCallbackUrl,
  buildLocalizedRedirectPath,
  getSiteUrl,
  sanitizeAuthNext,
} from "./oauth";

describe("supabase_oauth", () => {
  it("builds_google_callback_url_when_origin_header_is_available", () => {
    const callbackUrl = buildAuthCallbackUrl({
      siteUrl: getSiteUrl("http://localhost:3000"),
      next: "/chat/charon_f",
    });

    expect(callbackUrl).toBe(
      "http://localhost:3000/auth/callback?next=%2Fchat%2Fcharon_f",
    );
  });

  it("falls_back_to_public_app_url_when_origin_header_is_missing", () => {
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://monthlysaju.example";

    expect(getSiteUrl(null)).toBe("https://monthlysaju.example");

    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  });

  it("rejects_external_next_url_when_redirecting_after_login", () => {
    expect(sanitizeAuthNext("https://evil.example/phish")).toBe("/");
    expect(sanitizeAuthNext("//evil.example/phish")).toBe("/");
  });

  it("prefixes_default_locale_when_routing_requires_locale_prefix", () => {
    expect(buildLocalizedRedirectPath("/chat/charon_f", "ko")).toBe(
      "/ko/chat/charon_f",
    );
    expect(buildLocalizedRedirectPath("/ko/today", "ko")).toBe("/ko/today");
  });
});

