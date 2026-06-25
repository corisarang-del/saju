import { NextResponse, type NextRequest } from "next/server";
import { buildAuthCallbackUrl, getSiteUrl } from "@/lib/auth/oauth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const requestUrl = new URL(request.url);
  const next =
    requestUrl.searchParams.get("next") ??
    requestUrl.searchParams.get("redirectTo");
  const siteUrl = getSiteUrl(request.headers.get("origin"));
  const redirectTo = buildAuthCallbackUrl({ siteUrl, next });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    const loginUrl = new URL("/ko/login", siteUrl);
    loginUrl.searchParams.set("error", "google-login-unavailable");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(data.url);
}

