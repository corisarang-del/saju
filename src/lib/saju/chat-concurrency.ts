const activeGenerations = new Map<string, number>();

interface ChatGenerationLockRpcClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown | null; error: { message?: string } | null }>;
}

interface PersistentChatGenerationLockInput {
  userId: string;
  readingId: string;
  requestId: string;
}

export function acquireChatGenerationLock(
  key: string,
  now = Date.now(),
  ttlMs = 2 * 60 * 1000,
): boolean {
  const expiresAt = activeGenerations.get(key);
  if (expiresAt && expiresAt > now) {
    return false;
  }

  activeGenerations.set(key, now + ttlMs);
  return true;
}

export function releaseChatGenerationLock(key: string): void {
  activeGenerations.delete(key);
}

function readLockResult(data: unknown, key: "acquired" | "released"): boolean {
  const row = Array.isArray(data) ? data[0] : data;
  if (typeof row === "boolean") return row;
  if (row && typeof row === "object" && key in row) {
    return Boolean((row as Record<string, unknown>)[key]);
  }
  return false;
}

export async function acquirePersistentChatGenerationLock(
  client: ChatGenerationLockRpcClient,
  input: PersistentChatGenerationLockInput,
): Promise<boolean> {
  const { data, error } = await client.rpc("acquire_chat_generation_lock", {
    p_user_id: input.userId,
    p_reading_id: input.readingId,
    p_request_id: input.requestId,
  });

  if (error) {
    throw new Error(error.message || "CHAT_GENERATION_LOCK_ACQUIRE_FAILED");
  }

  return readLockResult(data, "acquired");
}

export async function releasePersistentChatGenerationLock(
  client: ChatGenerationLockRpcClient,
  input: PersistentChatGenerationLockInput,
): Promise<boolean> {
  const { data, error } = await client.rpc("release_chat_generation_lock", {
    p_user_id: input.userId,
    p_reading_id: input.readingId,
    p_request_id: input.requestId,
  });

  if (error) {
    throw new Error(error.message || "CHAT_GENERATION_LOCK_RELEASE_FAILED");
  }

  return readLockResult(data, "released");
}
