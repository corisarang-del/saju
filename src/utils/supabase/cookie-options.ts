import type { CookieOptions } from "@supabase/ssr";

const PKCE_CODE_VERIFIER_SUFFIX = "-auth-token-code-verifier";
const PKCE_CODE_VERIFIER_MAX_AGE_SECONDS = 10 * 60;

export function hardenSupabaseCookieOptions(
  name: string,
  options: CookieOptions,
  isProduction = process.env.NODE_ENV === "production",
): CookieOptions {
  if (!name.endsWith(PKCE_CODE_VERIFIER_SUFFIX)) {
    return options;
  }

  return {
    ...options,
    httpOnly: true,
    sameSite: options.sameSite ?? "lax",
    maxAge: PKCE_CODE_VERIFIER_MAX_AGE_SECONDS,
    secure: isProduction || options.secure,
  };
}
