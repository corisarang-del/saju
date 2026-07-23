const activeGenerations = new Map<string, number>();

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
