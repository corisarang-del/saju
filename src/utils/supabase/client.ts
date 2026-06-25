import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

export function createClient() {
  const supabaseConfig = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!supabaseConfig) {
    console.warn("Supabase credentials missing. Returning mock client.");
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithOAuth: async () => ({ error: null }),
        verifyOtp: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
      }),
    } as unknown as BrowserSupabaseClient;
  }

  return createBrowserClient(supabaseConfig.url, supabaseConfig.key);
}
