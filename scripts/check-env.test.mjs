import { describe, expect, it } from "vitest";
import { validateEnv } from "./check-env.js";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  GOOGLE_GENERATIVE_AI_API_KEY: "gemini-key",
  ADMIN_EMAILS: "admin@monthlysaju.local",
};

const validVertexEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  AI_PROVIDER: "vertex",
  GOOGLE_VERTEX_PROJECT: "project-123",
  GOOGLE_VERTEX_LOCATION: "us-central1",
  ADMIN_EMAILS: "admin@monthlysaju.local",
};

describe("check_env", () => {
  it("accepts_config_when_required_runtime_keys_are_present", () => {
    expect(validateEnv(validEnv)).toEqual({
      ok: true,
      missing: [],
      optionalMissing: [],
    });
  });

  it("accepts_vertex_config_without_google_api_key_when_adc_is_used", () => {
    expect(validateEnv(validVertexEnv)).toEqual({
      ok: true,
      missing: [],
      optionalMissing: [],
    });
  });

  it("reports_paddle_keys_only_when_paddle_env_check_is_required", () => {
    expect(validateEnv({ ...validEnv, REQUIRE_PADDLE_ENV: "true" })).toEqual({
      ok: false,
      missing: [
        "PADDLE_API_KEY",
        "PADDLE_WEBHOOK_SECRET",
        "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
        "NEXT_PUBLIC_PADDLE_ENVIRONMENT",
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_30",
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_70",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_70",
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_PREMIUM",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_PREMIUM",
      ],
      optionalMissing: [],
    });
  });

  it("reports_missing_required_keys_without_exposing_secret_values", () => {
    expect(
      validateEnv({
        ...validEnv,
        GOOGLE_GENERATIVE_AI_API_KEY: "your_gemini_api_key",
        ADMIN_EMAILS: "",
      }),
    ).toEqual({
      ok: false,
      missing: ["ADMIN_EMAILS", "GOOGLE_GENERATIVE_AI_API_KEY"],
      optionalMissing: [],
    });
  });

  it("reports_missing_vertex_project_and_location_when_vertex_provider_is_selected", () => {
    expect(
      validateEnv({
        ...validVertexEnv,
        GOOGLE_VERTEX_PROJECT: "",
        GOOGLE_VERTEX_LOCATION: "",
      }),
    ).toEqual({
      ok: false,
      missing: ["GOOGLE_VERTEX_PROJECT", "GOOGLE_VERTEX_LOCATION"],
      optionalMissing: [],
    });
  });
});
