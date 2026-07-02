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

const PADDLE_ENV_KEYS = [
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

function validateEnv(env) {
  const aiProvider = getAiProvider(env);
  const aiKeys = aiProvider === "vertex" ? GOOGLE_VERTEX_ENV_KEYS : GOOGLE_AI_ENV_KEYS;
  const requiredKeys = env.REQUIRE_PADDLE_ENV === "true"
    ? [...REQUIRED_ENV_KEYS, ...aiKeys, ...PADDLE_ENV_KEYS]
    : [...REQUIRED_ENV_KEYS, ...aiKeys];
  const missing = requiredKeys.filter((key) =>
    isPlaceholderValue(env[key]),
  );

  return {
    ok: missing.length === 0,
    missing,
    optionalMissing: [],
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
  PADDLE_ENV_KEYS,
  getAiProvider,
  isPlaceholderValue,
  validateEnv,
};
