/**
 * AI 모델 설정 — Google AI SDK 직접 연결
 * GOOGLE_GENERATIVE_AI_API_KEY 사용
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGateway } from "ai";
import type { EmbeddingModel, LanguageModel } from "ai";

/** Google AI SDK 인스턴스 (직접 연결, API 키 사용) */
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

/** Vercel AI Gateway (임베딩 전용) */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

/** SDS 텍스트 생성 기본 모델 */
const DEFAULT_MODEL = "gemini-2.5-flash-lite" as const;

/** A/B 테스트용 모델 옵션 */
export const SDS_MODEL_OPTIONS = [
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", cost: "$0.10/$0.40 per 1M" },
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite", cost: "$0.25/$1.50 per 1M" },
] as const;

export type SdsModelId = (typeof SDS_MODEL_OPTIONS)[number]["id"];

/** 챗봇용 모델 */
export function getChatModel(): LanguageModel {
  return google(DEFAULT_MODEL) as unknown as LanguageModel;
}

/** 임베딩용 모델 */
export function getEmbeddingModel(): EmbeddingModel {
  // 임베딩은 Gateway 또는 Google 직접 사용
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway.textEmbeddingModel("google/gemini-embedding-001") as unknown as EmbeddingModel;
  }
  return google.textEmbeddingModel("gemini-embedding-001") as unknown as EmbeddingModel;
}

/** 분류용 모델 (데이터 인제스트) */
export function getClassificationModel(): LanguageModel {
  return google(DEFAULT_MODEL) as unknown as LanguageModel;
}

/** 리드 분석용 모델 */
export function getAnalysisModel(): LanguageModel {
  return google(DEFAULT_MODEL) as unknown as LanguageModel;
}

/** SDS 텍스트 생성용 모델 (A/B 테스트 지원) */
export function getSdsTextModel(modelId?: SdsModelId): LanguageModel {
  const id = modelId || DEFAULT_MODEL;
  return google(id) as unknown as LanguageModel;
}
