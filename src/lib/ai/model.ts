import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { createGateway } from "ai";
import type { EmbeddingModel, LanguageModel } from "ai";
import type { ExternalAccountClientOptions } from "google-auth-library";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const DEFAULT_MODEL = "gemini-2.5-flash-lite" as const;
type AiProviderMode = "google" | "vertex";
type VertexProviderSettings = NonNullable<Parameters<typeof createVertex>[0]>;
interface VertexRequestOptions {
  vercelOidcToken?: string | null;
}

export const SDS_MODEL_OPTIONS = [
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", cost: "$0.10/$0.40 per 1M" },
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite", cost: "$0.25/$1.50 per 1M" },
] as const;

export type SdsModelId = (typeof SDS_MODEL_OPTIONS)[number]["id"];

type EnvLike = Record<string, string | undefined>;

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, "\n");
}

function getVertexCredentialsFromJson(env: EnvLike) {
  if (!env.GOOGLE_VERTEX_CREDENTIALS_JSON) {
    return null;
  }

  try {
    const parsed = JSON.parse(env.GOOGLE_VERTEX_CREDENTIALS_JSON) as {
      client_email?: string;
      private_key?: string;
      private_key_id?: string;
    };

    if (!parsed.client_email || !parsed.private_key) {
      return null;
    }

    return {
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
      ...(parsed.private_key_id ? { private_key_id: parsed.private_key_id } : {}),
    };
  } catch {
    return null;
  }
}

function getVertexCredentialsFromEnv(env: EnvLike) {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    return null;
  }

  return {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: normalizePrivateKey(env.GOOGLE_PRIVATE_KEY),
    ...(env.GOOGLE_PRIVATE_KEY_ID ? { private_key_id: env.GOOGLE_PRIVATE_KEY_ID } : {}),
  };
}

function getVertexWorkloadIdentityCredentials(
  env: EnvLike,
  options: VertexRequestOptions,
): ExternalAccountClientOptions | null {
  if (
    !options.vercelOidcToken
    || !env.GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE
    || !env.GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL
  ) {
    return null;
  }

  return {
    type: "external_account",
    audience: env.GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE,
    subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${env.GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: async () => options.vercelOidcToken ?? "",
    },
  };
}

export function getVercelOidcTokenFromRequest(req: Request): string | null {
  return req.headers.get("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN || null;
}

export function getVertexProviderSettings(
  env: EnvLike = process.env,
  options: VertexRequestOptions = {},
): VertexProviderSettings {
  const credentials = getVertexWorkloadIdentityCredentials(env, options)
    ?? getVertexCredentialsFromJson(env)
    ?? getVertexCredentialsFromEnv(env);

  return {
    ...(env.GOOGLE_VERTEX_PROJECT ? { project: env.GOOGLE_VERTEX_PROJECT } : {}),
    ...(env.GOOGLE_VERTEX_LOCATION ? { location: env.GOOGLE_VERTEX_LOCATION } : {}),
    ...(credentials ? { googleAuthOptions: { credentials } } : {}),
  };
}

const vertex = createVertex(getVertexProviderSettings());

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

export function getTextModel(
  modelId: SdsModelId = DEFAULT_MODEL,
  options: VertexRequestOptions = {},
): LanguageModel {
  if (getAiProviderMode() === "vertex") {
    if (options.vercelOidcToken) {
      return createVertex(getVertexProviderSettings(process.env, options))(modelId) as unknown as LanguageModel;
    }

    return vertex(modelId) as unknown as LanguageModel;
  }

  return google(modelId) as unknown as LanguageModel;
}

export function getChatModel(options: VertexRequestOptions = {}): LanguageModel {
  return getTextModel(DEFAULT_MODEL, options);
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
