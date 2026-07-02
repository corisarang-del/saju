import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { createGateway } from "ai";
import type { EmbeddingModel, LanguageModel } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

const vertex = createVertex();
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const DEFAULT_MODEL = "gemini-2.5-flash-lite" as const;
type AiProviderMode = "google" | "vertex";

export const SDS_MODEL_OPTIONS = [
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", cost: "$0.10/$0.40 per 1M" },
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite", cost: "$0.25/$1.50 per 1M" },
] as const;

export type SdsModelId = (typeof SDS_MODEL_OPTIONS)[number]["id"];

type EnvLike = Record<string, string | undefined>;

export function getDefaultTextModelId(): SdsModelId {
  return DEFAULT_MODEL;
}

export function getAiProviderMode(env: EnvLike = process.env): AiProviderMode {
  if (env.AI_PROVIDER === "google" || env.AI_PROVIDER === "vertex") {
    return env.AI_PROVIDER;
  }

  if (env.GOOGLE_VERTEX_PROJECT || env.GOOGLE_APPLICATION_CREDENTIALS) {
    return "vertex";
  }

  return "google";
}

export function getTextModel(modelId: SdsModelId = DEFAULT_MODEL): LanguageModel {
  if (getAiProviderMode() === "vertex") {
    return vertex(modelId) as unknown as LanguageModel;
  }

  return google(modelId) as unknown as LanguageModel;
}

export function getChatModel(): LanguageModel {
  return getTextModel(DEFAULT_MODEL);
}

export function getEmbeddingModel(): EmbeddingModel {
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway.textEmbeddingModel("google/gemini-embedding-001") as unknown as EmbeddingModel;
  }

  if (getAiProviderMode() === "vertex") {
    return vertex.textEmbeddingModel("gemini-embedding-001") as unknown as EmbeddingModel;
  }

  return google.textEmbeddingModel("gemini-embedding-001") as unknown as EmbeddingModel;
}

export function getClassificationModel(): LanguageModel {
  return getTextModel(DEFAULT_MODEL);
}

export function getAnalysisModel(): LanguageModel {
  return getTextModel(DEFAULT_MODEL);
}

export function getSdsTextModel(modelId?: SdsModelId): LanguageModel {
  return getTextModel(modelId || DEFAULT_MODEL);
}
