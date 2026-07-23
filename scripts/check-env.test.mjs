import { describe, expect, it } from "vitest";
import { validateEnv } from "./check-env.js";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  GOOGLE_GENERATIVE_AI_API_KEY: "gemini-key",
  ADMIN_EMAILS: "admin@monthlysaju.local",
  NEXT_PUBLIC_APP_URL: "https://monthlysaju.kr",
};

const validVertexEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  AI_PROVIDER: "vertex",
  GOOGLE_VERTEX_PROJECT: "project-123",
  GOOGLE_VERTEX_LOCATION: "us-central1",
  ADMIN_EMAILS: "admin@monthlysaju.local",
  APP_ORIGIN: "https://monthlysaju.kr",
};

describe("check_env", () => {
  it("accepts_config_when_required_runtime_keys_are_present", () => {
    expect(validateEnv(validEnv)).toEqual({
      ok: true,
      missing: [],
      optionalMissing: [],
      forbiddenPublicKeys: [],
    });
  });

  it("accepts_vertex_config_without_google_api_key_when_adc_is_used", () => {
    expect(validateEnv(validVertexEnv)).toEqual({
      ok: true,
      missing: [],
      optionalMissing: [],
      forbiddenPublicKeys: [],
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
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_10",
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_30",
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_70",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_70",
        "NEXT_PUBLIC_PADDLE_PRODUCT_STAR_PREMIUM",
        "NEXT_PUBLIC_PADDLE_PRICE_STAR_PREMIUM",
        "NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP",
        "NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP",
      ],
      optionalMissing: [],
      forbiddenPublicKeys: [],
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
      forbiddenPublicKeys: [],
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
      forbiddenPublicKeys: [],
    });
  });

  it("rejects_production_gate_when_app_origin_is_missing", () => {
    expect(
      validateEnv({
        ...validEnv,
        NEXT_PUBLIC_APP_URL: "",
        REQUIRE_PRODUCTION_ENV: "true",
      }),
    ).toEqual({
      ok: false,
      missing: expect.arrayContaining(["APP_ORIGIN_OR_NEXT_PUBLIC_APP_URL"]),
      optionalMissing: [],
      forbiddenPublicKeys: [],
    });
  });

  it("rejects_production_gate_without_shared_rate_limit_backend", () => {
    expect(
      validateEnv({
        ...validEnv,
        REQUIRE_PRODUCTION_ENV: "true",
        RATE_LIMIT_BACKEND: "memory",
      }),
    ).toEqual({
      ok: false,
      missing: ["RATE_LIMIT_BACKEND=supabase"],
      optionalMissing: [],
      forbiddenPublicKeys: [],
    });
  });

  it("rejects_free_beta_production_gate_when_payment_flags_are_enabled", () => {
    expect(
      validateEnv({
        ...validEnv,
        REQUIRE_PRODUCTION_ENV: "true",
        RATE_LIMIT_BACKEND: "supabase",
        PAYMENTS_ENABLED: "true",
        NEXT_PUBLIC_PAYMENTS_ENABLED: "true",
      }),
    ).toEqual({
      ok: false,
      missing: ["PAYMENTS_DISABLED_FOR_FREE_BETA"],
      optionalMissing: [],
      forbiddenPublicKeys: [],
    });
  });

  it("accepts_free_beta_production_gate_when_origin_rate_limit_and_payment_flags_are_safe", () => {
    expect(
      validateEnv({
        ...validEnv,
        REQUIRE_PRODUCTION_ENV: "true",
        RATE_LIMIT_BACKEND: "supabase",
        PAYMENTS_ENABLED: "false",
        NEXT_PUBLIC_PAYMENTS_ENABLED: "false",
      }),
    ).toEqual({
      ok: true,
      missing: [],
      optionalMissing: [],
      forbiddenPublicKeys: [],
    });
  });

  it("rejects_private_secret_values_exposed_as_next_public_env", () => {
    expect(
      validateEnv({
        ...validEnv,
        NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "leaked-service-role",
        NEXT_PUBLIC_PADDLE_API_KEY: "leaked-paddle-api",
        NEXT_PUBLIC_PADDLE_WEBHOOK_SECRET: "leaked-webhook-secret",
        NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY: "leaked-gemini-key",
      }),
    ).toEqual({
      ok: false,
      missing: [],
      optionalMissing: [],
      forbiddenPublicKeys: [
        "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
        "NEXT_PUBLIC_PADDLE_API_KEY",
        "NEXT_PUBLIC_PADDLE_WEBHOOK_SECRET",
        "NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY",
      ],
    });
  });
});
