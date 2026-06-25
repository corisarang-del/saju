import { describe, expect, it } from "vitest";
import {
  chooseAiProvider,
  createAiProviderRegistry,
} from "./ai-provider";

describe("chooseAiProvider", () => {
  it("returns_admin_selected_provider_when_available", () => {
    const registry = createAiProviderRegistry([
      { id: "gemini", label: "Gemini" },
      { id: "openai", label: "OpenAI" },
    ]);

    expect(chooseAiProvider(registry, "openai")).toEqual({
      id: "openai",
      label: "OpenAI",
    });
  });

  it("falls_back_to_default_provider_when_selected_provider_is_unknown", () => {
    const registry = createAiProviderRegistry([
      { id: "gemini", label: "Gemini" },
      { id: "anthropic", label: "Anthropic" },
    ]);

    expect(chooseAiProvider(registry, "openai")).toEqual({
      id: "gemini",
      label: "Gemini",
    });
  });
});

