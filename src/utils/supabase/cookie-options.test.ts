import { describe, expect, it } from "vitest";
import { hardenSupabaseCookieOptions } from "./cookie-options";

describe("hardenSupabaseCookieOptions", () => {
  it("adds_secure_httponly_and_short_ttl_when_cookie_is_pkce_code_verifier", () => {
    const hardened = hardenSupabaseCookieOptions(
      "sb-sfpwgywcmhgilrqearsz-auth-token-code-verifier",
      {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 34_560_000,
      },
      true,
    );

    expect(hardened).toEqual({
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 600,
      secure: true,
    });
  });

  it("keeps_regular_supabase_auth_cookie_readable_for_browser_client", () => {
    const hardened = hardenSupabaseCookieOptions(
      "sb-sfpwgywcmhgilrqearsz-auth-token",
      {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 34_560_000,
      },
      true,
    );

    expect(hardened).toEqual({
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 34_560_000,
    });
  });
}
);
