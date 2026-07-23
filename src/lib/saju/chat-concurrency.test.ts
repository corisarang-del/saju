import { describe, expect, it } from "vitest";
import {
  acquireChatGenerationLock,
  acquirePersistentChatGenerationLock,
  releaseChatGenerationLock,
  releasePersistentChatGenerationLock,
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

  it("uses_persistent_reading_lock_rpc_for_cross_instance_duplicate_chat_generation", async () => {
    const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
    const client = {
      async rpc(fn: string, args: Record<string, unknown>) {
        calls.push({ fn, args });
        return {
          data: fn === "acquire_chat_generation_lock"
            ? [{ acquired: true }]
            : [{ released: true }],
          error: null,
        };
      },
    };

    await expect(acquirePersistentChatGenerationLock(client, {
      userId: "user-1",
      readingId: "reading-1",
      requestId: "request-1",
    })).resolves.toBe(true);
    await expect(releasePersistentChatGenerationLock(client, {
      userId: "user-1",
      readingId: "reading-1",
      requestId: "request-1",
    })).resolves.toBe(true);

    expect(calls).toEqual([
      {
        fn: "acquire_chat_generation_lock",
        args: {
          p_user_id: "user-1",
          p_reading_id: "reading-1",
          p_request_id: "request-1",
        },
      },
      {
        fn: "release_chat_generation_lock",
        args: {
          p_user_id: "user-1",
          p_reading_id: "reading-1",
          p_request_id: "request-1",
        },
      },
    ]);
  });
});
