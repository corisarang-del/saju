import { describe, expect, it } from "vitest";
import {
  getAiProviderMode,
  getDefaultTextModelId,
  getVercelOidcTokenFromRequest,
  getVertexProviderSettings,
} from "./model";

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

  it("passes_service_account_credentials_to_vertex_when_env_is_present", () => {
    expect(
      getVertexProviderSettings({
        GOOGLE_VERTEX_PROJECT: "project-123",
        GOOGLE_VERTEX_LOCATION: "us-central1",
        GOOGLE_CLIENT_EMAIL: "vertex-service@project-123.iam.gserviceaccount.com",
        GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----",
        GOOGLE_PRIVATE_KEY_ID: "key-id-123",
      }),
    ).toEqual({
      project: "project-123",
      location: "us-central1",
      googleAuthOptions: {
        credentials: {
          client_email: "vertex-service@project-123.iam.gserviceaccount.com",
          private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----",
          private_key_id: "key-id-123",
        },
      },
    });
  });

  it("passes_service_account_json_credentials_to_vertex_when_env_is_present", () => {
    expect(
      getVertexProviderSettings({
        GOOGLE_VERTEX_PROJECT: "project-123",
        GOOGLE_VERTEX_LOCATION: "us-central1",
        GOOGLE_VERTEX_CREDENTIALS_JSON: JSON.stringify({
          client_email: "vertex-service@project-123.iam.gserviceaccount.com",
          private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----",
          private_key_id: "key-id-123",
        }),
      }),
    ).toEqual({
      project: "project-123",
      location: "us-central1",
      googleAuthOptions: {
        credentials: {
          client_email: "vertex-service@project-123.iam.gserviceaccount.com",
          private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----",
          private_key_id: "key-id-123",
        },
      },
    });
  });

  it("passes_vercel_oidc_workload_identity_credentials_to_vertex_when_env_is_present", async () => {
    const settings = getVertexProviderSettings(
      {
        GOOGLE_VERTEX_PROJECT: "project-123",
        GOOGLE_VERTEX_LOCATION: "us-central1",
        GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE:
          "//iam.googleapis.com/projects/282867567918/locations/global/workloadIdentityPools/vercel/providers/vercel",
        GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL:
          "monthlysaju-vertex@project-123.iam.gserviceaccount.com",
      },
      { vercelOidcToken: "vercel-oidc-token" },
    );

    expect({
      project: settings.project,
      location: settings.location,
      googleAuthOptions: {
        credentials: {
          ...(settings.googleAuthOptions?.credentials as Record<string, unknown>),
          subject_token_supplier: "redacted",
        },
      },
    }).toEqual({
      project: "project-123",
      location: "us-central1",
      googleAuthOptions: {
        credentials: {
          type: "external_account",
          audience:
            "//iam.googleapis.com/projects/282867567918/locations/global/workloadIdentityPools/vercel/providers/vercel",
          subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
          token_url: "https://sts.googleapis.com/v1/token",
          service_account_impersonation_url:
            "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/monthlysaju-vertex@project-123.iam.gserviceaccount.com:generateAccessToken",
          subject_token_supplier: "redacted",
        },
      },
    });
    await expect(
      (
        (settings.googleAuthOptions?.credentials as {
          subject_token_supplier: { getSubjectToken: () => Promise<string> };
        }).subject_token_supplier
      ).getSubjectToken(),
    ).resolves.toBe("vercel-oidc-token");
  });

  it("reads_vercel_oidc_token_from_function_request_headers", () => {
    const request = new Request("https://monthlysaju.vercel.app/api/saju/chat", {
      headers: { "x-vercel-oidc-token": "vercel-oidc-token" },
    });

    expect(getVercelOidcTokenFromRequest(request)).toBe("vercel-oidc-token");
  });
});
