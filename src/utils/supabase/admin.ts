import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

// Admin Client (service_role) - RLS를 우회
// 웹훅, 백그라운드 작업 등 서버 전용으로만 사용
export function createAdminClient() {
  const supabaseConfig = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  if (!supabaseConfig) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseConfig.url, supabaseConfig.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
