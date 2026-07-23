import { createAdminClient } from "@/utils/supabase/admin";

export type RateLimitResult = { success: boolean; remaining: number };

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const RATE_LIMIT_SHARED_BACKEND_REQUIRED = "RATE_LIMIT_SHARED_BACKEND_REQUIRED";

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

type RateLimitBackendInput = {
  identifier: string;
  limit: number;
  windowMs: number;
};

type RateLimitBackend = (input: RateLimitBackendInput) => Promise<RateLimitResult>;

let testBackend: RateLimitBackend | null = null;

export function setRateLimitBackendForTests(backend: RateLimitBackend | null) {
  testBackend = backend;
}

function checkMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  cleanup(windowMs);

  const entry = store.get(identifier) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);

  return { success: true, remaining: limit - entry.timestamps.length };
}

async function checkSupabaseRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const windowSeconds = Math.ceil(windowMs / 1000);
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw new Error(`check_rate_limit failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    success: Boolean(row?.allowed),
    remaining: Math.max(0, Number(row?.remaining ?? 0)),
  };
}

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (testBackend) {
    return testBackend({ identifier, limit, windowMs });
  }

  const backend = process.env.RATE_LIMIT_BACKEND || "memory";
  if (backend === "supabase") {
    return checkSupabaseRateLimit(identifier, limit, windowMs);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(RATE_LIMIT_SHARED_BACKEND_REQUIRED);
  }

  return checkMemoryRateLimit(identifier, limit, windowMs);
}
