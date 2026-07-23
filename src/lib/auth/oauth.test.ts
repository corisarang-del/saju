import { describe, expect, it, vi } from "vitest";
import {
  buildAuthCallbackUrl,
  buildAuthRedirectUrl,
  buildLocalizedRedirectPath,
  getSiteUrl,
  getSiteUrlFromRequestHeaders,
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

  it("uses_forwarded_host_when_origin_header_is_missing", () => {
    expect(
      getSiteUrlFromRequestHeaders(
        new Headers({
          "x-forwarded-host":
            "deeply-incorporated-editorials-ntsc.trycloudflare.com",
          "x-forwarded-proto": "https",
        }),
      ),
    ).toBe("https://deeply-incorporated-editorials-ntsc.trycloudflare.com");
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

  it("redirects_to_forwarded_host_after_callback_when_request_origin_is_bind_address", () => {
    const redirectUrl = buildAuthRedirectUrl({
      requestUrl: "http://0.0.0.0:3000/auth/callback?code=test-code",
      headers: new Headers({
        "x-forwarded-host":
          "deeply-incorporated-editorials-ntsc.trycloudflare.com",
        "x-forwarded-proto": "https",
      }),
      path: "/ko/today",
    });

    expect(redirectUrl).toBe(
      "https://deeply-incorporated-editorials-ntsc.trycloudflare.com/ko/today",
    );
  });

  it("uses_configured_app_origin_before_untrusted_forwarded_headers_in_production", () => {
    try {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ORIGIN", "https://monthlysaju.com");
      vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://monthlysaju-public.example");

      expect(
        getSiteUrlFromRequestHeaders(
          new Headers({
            origin: "https://evil.example",
            "x-forwarded-host": "evil-forwarded.example",
            "x-forwarded-proto": "https",
          }),
        ),
      ).toBe("https://monthlysaju.com");

      expect(
        buildAuthRedirectUrl({
          requestUrl: "https://monthlysaju.com/auth/callback?code=test-code",
          headers: new Headers({
            origin: "https://evil.example",
            "x-forwarded-host": "evil-forwarded.example",
            "x-forwarded-proto": "https",
          }),
          path: "/ko/today",
        }),
      ).toBe("https://monthlysaju.com/ko/today");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("fails_closed_when_production_app_origin_is_not_configured", () => {
    try {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_ORIGIN", "");
      vi.stubEnv("NEXT_PUBLIC_APP_URL", "");

      expect(() =>
        getSiteUrlFromRequestHeaders(
          new Headers({
            origin: "https://evil.example",
            "x-forwarded-host": "evil-forwarded.example",
            "x-forwarded-proto": "https",
          }),
        ),
      ).toThrow("PRODUCTION_APP_ORIGIN_REQUIRED");

      expect(() =>
        buildAuthRedirectUrl({
          requestUrl: "https://monthlysaju.com/auth/callback?code=test-code",
          headers: new Headers({
            origin: "https://evil.example",
            "x-forwarded-host": "evil-forwarded.example",
            "x-forwarded-proto": "https",
          }),
          path: "/ko/today",
        }),
      ).toThrow("PRODUCTION_APP_ORIGIN_REQUIRED");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
