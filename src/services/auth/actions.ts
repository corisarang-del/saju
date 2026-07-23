"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildAuthCallbackUrl, getSiteUrlFromRequestHeaders } from "@/lib/auth/oauth";

/**
 * Initiates the Google OAuth flow.
 * It redirects the user to Google's login page.
 */
export async function loginWithGoogle(next?: string) {
  const supabase = await createClient();
  const siteUrl = getSiteUrlFromRequestHeaders(await headers());
  const redirectTo = buildAuthCallbackUrl({ siteUrl, next });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("Google Login Error:", error);
    redirect("/ko/login?error=supabase-env-missing");
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Initiates the Kakao OAuth flow.
 */
export async function loginWithKakao(next?: string) {
  const supabase = await createClient();
  const siteUrl = getSiteUrlFromRequestHeaders(await headers());
  const redirectTo = buildAuthCallbackUrl({ siteUrl, next });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("Kakao Login Error:", error);
    redirect("/ko/login?error=supabase-env-missing");
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Sends a Magic Link (passwordless login) to the user's email.
 */
export async function loginWithMagicLink(email: string) {
  const supabase = await createClient();
  const siteUrl = getSiteUrlFromRequestHeaders(await headers());

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Allows the user to be redirected to the dashboard after clicking the link
      emailRedirectTo: buildAuthCallbackUrl({ siteUrl }),
    },
  });

  if (error) {
    console.error("Magic Link Error:", error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Signs out the current user and redirects to the home page.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
