import { describe, expect, it } from "vitest";
import {
  getUserFacingChatErrorMessage,
  serializeChatProviderError,
} from "./chat-error-handling";

describe("chat_error_handling", () => {
  it("maps_quota_or_rate_limit_errors_to_recoverable_user_message", () => {
    expect(
      getUserFacingChatErrorMessage(
        new Error("quota exceeded for free tier request limit"),
      ),
    ).toBe("지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.");

    expect(
      getUserFacingChatErrorMessage({ statusCode: 429, message: "rate limit" }),
    ).toBe("지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.");
  });

  it("keeps_generic_provider_errors_safe_for_users", () => {
    expect(getUserFacingChatErrorMessage(new Error("API key leaked"))).toBe(
      "분석 응답을 만들지 못했어. 잠시 후 다시 시도해줘.",
    );
  });

  it("keeps_existing_user_facing_korean_errors_from_the_stream", () => {
    expect(
      getUserFacingChatErrorMessage(
        new Error("지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘."),
      ),
    ).toBe("지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.");

    expect(
      getUserFacingChatErrorMessage(
        new Error("분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘."),
      ),
    ).toBe("분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.");

    expect(
      getUserFacingChatErrorMessage(
        new Error("응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘."),
      ),
    ).toBe("응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘.");
  });

  it("serializes_provider_errors_with_debuggable_fields_for_logs", () => {
    const error = Object.assign(new Error("quota exceeded"), {
      name: "AI_RetryError",
      statusCode: 429,
      cause: new Error("free tier request limit"),
    });

    expect(serializeChatProviderError(error)).toEqual({
      name: "AI_RetryError",
      message: "quota exceeded",
      statusCode: 429,
      causeName: "Error",
      causeMessage: "free tier request limit",
      isQuotaOrRateLimit: true,
    });
  });
});
