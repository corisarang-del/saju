import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hardenSupabaseCookieOptions } from "./cookie-options";
import { getSupabaseConfig } from "./config";

type EmptyQueryResult<T = null> = Promise<{ data: T; error: null }>;

class MissingSupabaseQuery {
  select(): this {
    return this;
  }

  insert(): this {
    return this;
  }

  update(): this {
    return this;
  }

  delete(): this {
    return this;
  }

  eq(): this {
    return this;
  }

  in(): this {
    return this;
  }

  gte(): this {
    return this;
  }

  order(): this {
    return this;
  }

  limit(): this {
    return this;
  }

  single(): EmptyQueryResult {
    return Promise.resolve({ data: null, error: null });
  }

  maybeSingle(): EmptyQueryResult {
    return Promise.resolve({ data: null, error: null });
  }

  then<TResult1 = { data: null; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: null; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve({ data: null, error: null }).then(onfulfilled, onrejected);
  }
}

function createMissingSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ data: { url: null }, error: new Error("Supabase env is not configured") }),
      signInWithOtp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase env is not configured") }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: { session: null }, error: new Error("Supabase env is not configured") }),
    },
    from: () => new MissingSupabaseQuery(),
    rpc: async () => ({ data: null, error: null }),
  };
}

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseConfig = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!supabaseConfig) {
    return createMissingSupabaseClient();
  }

  return createServerClient(
    supabaseConfig.url,
    supabaseConfig.key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, hardenSupabaseCookieOptions(name, options))
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
