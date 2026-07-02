import { describe, expect, it } from "vitest";
import { getAiProviderMode, getDefaultTextModelId } from "./model";

describe("ai_model_provider", () => {
  it("uses_vertex_when_ai_provider_is_vertex", () => {
    expect(getAiProviderMode({ AI_PROVIDER: "vertex" })).toBe("vertex");
  });

  it("uses_vertex_when_google_vertex_project_is_configured", () => {
    expect(getAiProviderMode({ GOOGLE_VERTEX_PROJECT: "project-123" })).toBe("vertex");
  });

  it("keeps_google_api_key_provider_when_explicitly_requested", () => {
    expect(
      getAiProviderMode({
        AI_PROVIDER: "google",
        GOOGLE_VERTEX_PROJECT: "project-123",
      }),
    ).toBe("google");
  });

  it("keeps_gemini_25_flash_lite_as_default_text_model", () => {
    expect(getDefaultTextModelId()).toBe("gemini-2.5-flash-lite");
  });
});
