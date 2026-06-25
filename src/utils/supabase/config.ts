const PLACEHOLDER_VALUES = new Set([
  "your_supabase_url",
  "your_supabase_anon_key",
  "your_service_role_key",
  "https://your-project-id.supabase.co",
]);

export interface SupabaseConfig {
  url: string;
  key: string;
}

export function isSupabaseConfigured(
  supabaseUrl: string | undefined,
  supabaseKey: string | undefined,
): boolean {
  return getSupabaseConfig(supabaseUrl, supabaseKey) !== null;
}

export function getSupabaseConfig(
  supabaseUrl: string | undefined,
  supabaseKey: string | undefined,
): SupabaseConfig | null {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (PLACEHOLDER_VALUES.has(supabaseUrl) || PLACEHOLDER_VALUES.has(supabaseKey)) {
    return null;
  }

  return { url: supabaseUrl, key: supabaseKey };
}
