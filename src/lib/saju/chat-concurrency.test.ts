import { describe, expect, it } from "vitest";
import {
  acquireChatGenerationLock,
  releaseChatGenerationLock,
} from "./chat-concurrency";

describe("chat_generation_lock", () => {
  it("rejects_second_generation_when_same_user_already_has_active_generation", () => {
    const key = "user-1";
    releaseChatGenerationLock(key);

    expect(acquireChatGenerationLock(key, 1_000, 60_000)).toBe(true);
    expect(acquireChatGenerationLock(key, 2_000, 60_000)).toBe(false);

    releaseChatGenerationLock(key);
  });

  it("allows_generation_when_previous_generation_was_released", () => {
    const key = "user-2";
    releaseChatGenerationLock(key);

    expect(acquireChatGenerationLock(key, 1_000, 60_000)).toBe(true);
    releaseChatGenerationLock(key);
    expect(acquireChatGenerationLock(key, 2_000, 60_000)).toBe(true);

    releaseChatGenerationLock(key);
  });

  it("allows_generation_when_previous_lock_expired", () => {
    const key = "user-3";
    releaseChatGenerationLock(key);

    expect(acquireChatGenerationLock(key, 1_000, 60_000)).toBe(true);
    expect(acquireChatGenerationLock(key, 62_000, 60_000)).toBe(true);

    releaseChatGenerationLock(key);
  });
});
