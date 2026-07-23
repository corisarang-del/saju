#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("node:path");
const dotenv = require("dotenv");

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAILS",
];

const GOOGLE_AI_ENV_KEYS = ["GOOGLE_GENERATIVE_AI_API_KEY"];
const GOOGLE_VERTEX_ENV_KEYS = ["GOOGLE_VERTEX_PROJECT", "GOOGLE_VERTEX_LOCATION"];
const GOOGLE_VERTEX_RUNTIME_AUTH_KEY = "GOOGLE_VERTEX_RUNTIME_AUTH";

const PADDLE_ENV_KEYS = [
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
];

const APP_ORIGIN_ENV_KEY = "APP_ORIGIN_OR_NEXT_PUBLIC_APP_URL";
const RATE_LIMIT_BACKEND_ENV_KEY = "RATE_LIMIT_BACKEND=supabase";
const PAYMENTS_DISABLED_FREE_BETA_KEY = "PAYMENTS_DISABLED_FOR_FREE_BETA";

const FORBIDDEN_PUBLIC_SECRET_KEYS = [
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_PADDLE_API_KEY",
  "NEXT_PUBLIC_PADDLE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY",
  "NEXT_PUBLIC_GOOGLE_VERTEX_PROJECT",
  "NEXT_PUBLIC_GOOGLE_VERTEX_LOCATION",
  "NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL",
  "NEXT_PUBLIC_GOOGLE_PRIVATE_KEY",
  "NEXT_PUBLIC_GOOGLE_PRIVATE_KEY_ID",
  "NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS",
  "NEXT_PUBLIC_GOOGLE_VERTEX_CREDENTIALS_JSON",
  "NEXT_PUBLIC_GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE",
  "NEXT_PUBLIC_GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL",
];

function isPlaceholderValue(value) {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized === "" ||
    normalized.includes("your_") ||
    normalized.includes("example") ||
    normalized.includes("placeholder") ||
    normalized.includes("change_me")
  );
}

function getAiProvider(env) {
  if (env.AI_PROVIDER === "google" || env.AI_PROVIDER === "vertex") {
    return env.AI_PROVIDER;
  }

  if (!isPlaceholderValue(env.GOOGLE_VERTEX_PROJECT)) {
    return "vertex";
  }

  return "google";
}

function isTrueValue(value) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

function hasVertexServiceAccountPair(env) {
  return !isPlaceholderValue(env.GOOGLE_CLIENT_EMAIL)
    && !isPlaceholderValue(env.GOOGLE_PRIVATE_KEY);
}

function hasVertexCredentialsJson(env) {
  if (isPlaceholderValue(env.GOOGLE_VERTEX_CREDENTIALS_JSON)) {
    return false;
  }

  try {
    const parsed = JSON.parse(env.GOOGLE_VERTEX_CREDENTIALS_JSON);
    return !isPlaceholderValue(parsed?.client_email)
      && !isPlaceholderValue(parsed?.private_key);
  } catch {
    return false;
  }
}

function hasVertexWorkloadIdentity(env) {
  return !isPlaceholderValue(env.GOOGLE_VERTEX_WORKLOAD_IDENTITY_AUDIENCE)
    && !isPlaceholderValue(env.GOOGLE_VERTEX_SERVICE_ACCOUNT_EMAIL);
}

function hasVertexRuntimeAuth(env) {
  return !isPlaceholderValue(env.GOOGLE_APPLICATION_CREDENTIALS)
    || hasVertexServiceAccountPair(env)
    || hasVertexCredentialsJson(env)
    || hasVertexWorkloadIdentity(env);
}

function validateEnv(env) {
  const aiProvider = getAiProvider(env);
  const aiKeys = aiProvider === "vertex" ? GOOGLE_VERTEX_ENV_KEYS : GOOGLE_AI_ENV_KEYS;
  const requiredKeys = env.REQUIRE_PADDLE_ENV === "true"
    ? [...REQUIRED_ENV_KEYS, ...aiKeys, ...PADDLE_ENV_KEYS]
    : [...REQUIRED_ENV_KEYS, ...aiKeys];
  const missing = requiredKeys.filter((key) =>
    isPlaceholderValue(env[key]),
  );
  const forbiddenPublicKeys = FORBIDDEN_PUBLIC_SECRET_KEYS.filter((key) =>
    !isPlaceholderValue(env[key]),
  );

  if (
    (isTrueValue(env.REQUIRE_PRODUCTION_ENV) || isTrueValue(env.REQUIRE_PADDLE_ENV))
    && isPlaceholderValue(env.APP_ORIGIN)
    && isPlaceholderValue(env.NEXT_PUBLIC_APP_URL)
  ) {
    missing.unshift(APP_ORIGIN_ENV_KEY);
  }

  if (
    isTrueValue(env.REQUIRE_PRODUCTION_ENV)
    && String(env.RATE_LIMIT_BACKEND ?? "").trim().toLowerCase() !== "supabase"
  ) {
    missing.push(RATE_LIMIT_BACKEND_ENV_KEY);
  }

  if (
    isTrueValue(env.REQUIRE_PRODUCTION_ENV)
    && aiProvider === "vertex"
    && !hasVertexRuntimeAuth(env)
  ) {
    missing.push(GOOGLE_VERTEX_RUNTIME_AUTH_KEY);
  }

  if (
    isTrueValue(env.REQUIRE_PRODUCTION_ENV)
    && !isTrueValue(env.REQUIRE_PADDLE_ENV)
    && (isTrueValue(env.PAYMENTS_ENABLED) || isTrueValue(env.NEXT_PUBLIC_PAYMENTS_ENABLED))
  ) {
    missing.push(PAYMENTS_DISABLED_FREE_BETA_KEY);
  }

  return {
    ok: missing.length === 0 && forbiddenPublicKeys.length === 0,
    missing,
    optionalMissing: [],
    forbiddenPublicKeys,
  };
}

function loadLocalEnv(cwd = process.cwd()) {
  dotenv.config({ path: path.join(cwd, ".env.local"), quiet: true });
  dotenv.config({ path: path.join(cwd, ".env"), quiet: true });
}

function main() {
  loadLocalEnv();
  const result = validateEnv(process.env);

  if (!result.ok) {
    console.error("필수 환경변수가 비어 있거나 placeholder 값이야:");
    for (const key of result.missing) {
      console.error(`- ${key}`);
    }
    if (result.forbiddenPublicKeys.length > 0) {
      console.error("NEXT_PUBLIC_로 노출하면 안 되는 비밀 환경변수가 있어:");
      for (const key of result.forbiddenPublicKeys) {
        console.error(`- ${key}`);
      }
    }
    process.exit(1);
  }

  console.log("필수 환경변수 검사를 통과했어.");

  if (process.env.REQUIRE_PADDLE_ENV !== "true") {
    console.log("Paddle 환경변수 검사는 REQUIRE_PADDLE_ENV=true일 때만 실행해.");
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  REQUIRED_ENV_KEYS,
  GOOGLE_AI_ENV_KEYS,
  GOOGLE_VERTEX_ENV_KEYS,
  GOOGLE_VERTEX_RUNTIME_AUTH_KEY,
  PADDLE_ENV_KEYS,
  APP_ORIGIN_ENV_KEY,
  RATE_LIMIT_BACKEND_ENV_KEY,
  PAYMENTS_DISABLED_FREE_BETA_KEY,
  FORBIDDEN_PUBLIC_SECRET_KEYS,
  getAiProvider,
  hasVertexRuntimeAuth,
  isPlaceholderValue,
  validateEnv,
};
