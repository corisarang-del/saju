import { createHmac } from "node:crypto";
import { lookup } from "node:dns/promises";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

const starProductId = process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10;
const starPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_10;
const membershipProductId = process.env.NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP;
const membershipPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP;

const runId = Date.now();
const qaEmail = `qa-paddle-webhook-${runId}@example.com`;
const qaPassword = `Qa-paddle-${runId}!`;
let createdUserId = null;
let admin = null;

function assert(condition, message, extra = undefined) {
  if (!condition) {
    const error = new Error(message);
    error.extra = extra;
    throw error;
  }
}

function assertRequiredEnv() {
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
    ["PADDLE_WEBHOOK_SECRET", webhookSecret],
    ["NEXT_PUBLIC_PADDLE_PRODUCT_STAR_10", starProductId],
    ["NEXT_PUBLIC_PADDLE_PRICE_STAR_10", starPriceId],
    ["NEXT_PUBLIC_PADDLE_PRODUCT_MONTHLY_MEMBERSHIP", membershipProductId],
    ["NEXT_PUBLIC_PADDLE_PRICE_MONTHLY_MEMBERSHIP", membershipPriceId],
  ].filter(([, value]) => !value || String(value).includes("placeholder"));

  assert(missing.length === 0, "Missing Paddle webhook QA env", {
    missing: missing.map(([key]) => key),
  });
}

async function assertSupabaseDnsReachable() {
  const host = new URL(supabaseUrl).host;
  try {
    await lookup(host);
  } catch (error) {
    const dnsError = new Error("Supabase DNS lookup failed");
    dnsError.extra = {
      host,
      code: error?.code,
      command: `curl -I https://${host}/auth/v1/health`,
    };
    throw dnsError;
  }
}

function signPayload(rawBody, timestamp = Math.floor(Date.now() / 1000)) {
  const h1 = createHmac("sha256", webhookSecret)
    .update(`${timestamp}:${rawBody}`)
    .digest("hex");
  return `ts=${timestamp};h1=${h1}`;
}

async function postWebhook(payload, { signed = true } = {}) {
  const rawBody = JSON.stringify(payload);
  const headers = { "content-type": "application/json" };
  if (signed) {
    headers["Paddle-Signature"] = signPayload(rawBody);
  }

  const response = await fetch(`${baseUrl}/api/webhooks/paddle`, {
    method: "POST",
    headers,
    body: rawBody,
  });
  const body = await response.text();
  return { status: response.status, body };
}

function transactionPayload({ eventType, transactionId }) {
  return {
    event_id: `evt_${transactionId}`,
    event_type: eventType,
    occurred_at: new Date().toISOString(),
    data: {
      id: transactionId,
      status: eventType === "transaction.completed" ? "completed" : "payment_failed",
      custom_data: {
        userId: createdUserId,
        productType: "stars10",
      },
      items: [
        {
          price: {
            id: starPriceId,
            product_id: starProductId,
          },
          quantity: 1,
        },
      ],
    },
  };
}

function subscriptionPayload({ eventType, subscriptionId, status }) {
  return {
    event_id: `evt_${subscriptionId}_${status}`,
    event_type: eventType,
    occurred_at: new Date().toISOString(),
    data: {
      id: subscriptionId,
      status,
      canceled_at: status === "canceled" ? new Date().toISOString() : null,
      custom_data: {
        userId: createdUserId,
        productType: "monthlyMembership",
      },
      current_billing_period: {
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      items: [
        {
          price: {
            id: membershipPriceId,
            product_id: membershipProductId,
          },
          quantity: 1,
        },
      ],
    },
  };
}

async function getStarState() {
  const { data: stars, error: starError } = await admin
    .from("user_stars")
    .select("balance")
    .eq("user_id", createdUserId)
    .single();
  assert(!starError && stars, "Star fetch failed", starError);

  const { data: transactions, error: txError } = await admin
    .from("star_transactions")
    .select("amount,balance_after,type,paddle_transaction_id")
    .eq("user_id", createdUserId)
    .order("created_at", { ascending: true });
  assert(!txError && transactions, "Transaction fetch failed", txError);

  return { balance: stars.balance, transactions };
}

async function getMembership(subscriptionId) {
  const { data, error } = await admin
    .from("user_memberships")
    .select("status,subscription_id")
    .eq("user_id", createdUserId)
    .eq("provider", "paddle")
    .eq("subscription_id", subscriptionId)
    .maybeSingle();
  assert(!error, "Membership fetch failed", error);
  return data;
}

async function run() {
  assertRequiredEnv();
  await assertSupabaseDnsReachable();

  admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: qaEmail,
    password: qaPassword,
    email_confirm: true,
  });
  assert(!createError && created.user?.id, "Auth user create failed", createError);
  createdUserId = created.user.id;

  const { error: starInsertError } = await admin
    .from("user_stars")
    .insert({ user_id: createdUserId, balance: 0 });
  assert(!starInsertError, "Initial stars insert failed", starInsertError);

  const unsigned = await postWebhook(
    transactionPayload({ eventType: "transaction.completed", transactionId: `txn_unsigned_${runId}` }),
    { signed: false },
  );
  assert(unsigned.status === 401, "Unsigned Paddle webhook was not rejected", unsigned);

  const failed = await postWebhook(
    transactionPayload({ eventType: "transaction.payment_failed", transactionId: `txn_failed_${runId}` }),
  );
  assert(failed.status === 200, "Signed payment_failed webhook did not return ok", failed);
  assert((await getStarState()).balance === 0, "payment_failed changed star balance");

  const transactionId = `txn_completed_${runId}`;
  const completed = await postWebhook(
    transactionPayload({ eventType: "transaction.completed", transactionId }),
  );
  assert(completed.status === 200, "Signed transaction.completed webhook failed", {
    ...completed,
    hint: "운영 endpoint에서 401이면 Vercel PADDLE_WEBHOOK_SECRET과 Paddle destination secret 불일치를 먼저 확인해.",
  });
  const credited = await getStarState();
  assert(credited.balance === 10, "Completed transaction did not credit exactly 10 stars", credited);
  assert(
    credited.transactions.filter((tx) => tx.paddle_transaction_id === transactionId).length === 1,
    "Completed transaction log count mismatch",
    credited,
  );

  const duplicate = await postWebhook(
    transactionPayload({ eventType: "transaction.completed", transactionId }),
  );
  assert(duplicate.status === 200, "Duplicate transaction replay did not return ok", duplicate);
  const afterDuplicate = await getStarState();
  assert(afterDuplicate.balance === 10, "Duplicate transaction credited stars again", afterDuplicate);
  assert(
    afterDuplicate.transactions.filter((tx) => tx.paddle_transaction_id === transactionId).length === 1,
    "Duplicate transaction created another transaction log",
    afterDuplicate,
  );

  const subscriptionId = `sub_${runId}`;
  const activated = await postWebhook(
    subscriptionPayload({
      eventType: "subscription.activated",
      subscriptionId,
      status: "active",
    }),
  );
  assert(activated.status === 200, "Signed subscription.activated webhook failed", activated);
  assert((await getMembership(subscriptionId))?.status === "active", "Membership was not activated");

  const canceled = await postWebhook(
    subscriptionPayload({
      eventType: "subscription.canceled",
      subscriptionId,
      status: "canceled",
    }),
  );
  assert(canceled.status === 200, "Signed subscription.canceled webhook failed", canceled);
  assert((await getMembership(subscriptionId))?.status === "canceled", "Membership was not canceled");

  return {
    userId: createdUserId,
    baseUrl,
    creditedBalance: afterDuplicate.balance,
    transactionId,
    subscriptionId,
  };
}

async function cleanup() {
  if (!admin || !createdUserId) return;

  await admin.from("user_memberships").delete().eq("user_id", createdUserId);
  await admin.from("star_transactions").delete().eq("user_id", createdUserId);
  await admin.from("user_stars").delete().eq("user_id", createdUserId);
  await admin.auth.admin.deleteUser(createdUserId);
}

try {
  const result = await run();
  console.log(JSON.stringify({ ok: true, result }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    message: error.message,
    extra: error.extra,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await cleanup();
}
