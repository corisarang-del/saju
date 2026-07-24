import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("production_security_hardening_regression", () => {
  it("removes_framework_fingerprint_and_adds_cross_origin_headers", () => {
    const config = readProjectFile("next.config.ts");

    expect(config).toContain("poweredByHeader: false");
    expect(config).toContain("Cross-Origin-Opener-Policy");
    expect(config).toContain("same-origin");
    expect(config).toContain("Cross-Origin-Resource-Policy");
    expect(config).toContain("same-origin");
  });

  it("keeps_csp_frame_ancestors_minimal_and_removes_eval_from_scripts", () => {
    const config = readProjectFile("next.config.ts");

    expect(config).toContain("\"frame-ancestors 'self'\"");
    expect(config).not.toContain("frame-ancestors 'self' https://*.paddle.com");
    expect(config).not.toContain("'unsafe-eval'");
    expect(config).toContain("frame-src 'self' https://accounts.google.com https://*.paddle.com https://buy.paddle.com");
  });

  it("hardens_next_intl_locale_cookie_for_production", () => {
    const routing = readProjectFile("src/i18n/routing.ts");

    expect(routing).toContain("localeCookie");
    expect(routing).toContain('name: "NEXT_LOCALE"');
    expect(routing).toContain('sameSite: "lax"');
    expect(routing).toContain('secure: process.env.NODE_ENV === "production"');
  });

  it("uses_the_configured_public_app_url_for_metadata_and_jsonld", () => {
    const layout = readProjectFile("src/app/[locale]/layout.tsx");

    expect(layout).toContain("getPublicAppUrl()");
    expect(layout).toContain("const baseUrl = getPublicAppUrl()");
    expect(layout).toContain("url: baseUrl");
    expect(layout).not.toContain('"https://monthly-saju.com"');
  });

  it("uses_hardened_supabase_cookie_options_in_server_and_middleware_clients", () => {
    const server = readProjectFile("src/utils/supabase/server.ts");
    const middleware = readProjectFile("src/utils/supabase/middleware.ts");
    const proxy = readProjectFile("src/proxy.ts");

    expect(server).toContain("hardenSupabaseCookieOptions(name, options)");
    expect(middleware).toContain("hardenSupabaseCookieOptions(name, options)");
    expect(proxy).toContain("hardenSupabaseCookieOptions");
  });

  it("auth_required_routes_return_401_before_body_or_status_validation", () => {
    const deductStars = readProjectFile("src/app/api/saju/deduct-stars/route.ts");
    const updateStatus = readProjectFile("src/app/api/saju/update-status/route.ts");

    const deductUserIndex = deductStars.indexOf("await supabase.auth.getUser()");
    const deductJsonIndex = deductStars.indexOf("await req.json()");
    expect(deductUserIndex).toBeGreaterThan(-1);
    expect(deductJsonIndex).toBeGreaterThan(deductUserIndex);

    const updateUserIndex = updateStatus.indexOf("await supabase.auth.getUser()");
    const updateJsonIndex = updateStatus.indexOf("await req.json()");
    const privilegedStatusIndex = updateStatus.indexOf("isPrivilegedReadingStatus(status)");
    expect(updateUserIndex).toBeGreaterThan(-1);
    expect(updateJsonIndex).toBeGreaterThan(updateUserIndex);
    expect(privilegedStatusIndex).toBeGreaterThan(updateUserIndex);
  });
});
