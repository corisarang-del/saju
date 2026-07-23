import dotenv from "dotenv";
import { lookup } from "node:dns/promises";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const scenario = process.env.QA_SCENARIO ?? "full";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase env");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const qaEmail = `qa-live-${Date.now()}@example.com`;
const qaPassword = `Qa-live-${Date.now()}!`;
const createdReadingIds = [];
let createdUserId = null;

const fourPillars = {
  year: { heavenlyStem: "갑", earthlyBranch: "자" },
  month: { heavenlyStem: "병", earthlyBranch: "인" },
  day: { heavenlyStem: "경", earthlyBranch: "오" },
  hour: { heavenlyStem: "임", earthlyBranch: "신" },
};

const fiveElements = {
  wood: 2,
  fire: 2,
  earth: 1,
  metal: 2,
  water: 1,
};

function assert(condition, message, extra = undefined) {
  if (!condition) {
    const error = new Error(message);
    error.extra = extra;
    throw error;
  }
}

function getSupabaseHost() {
  try {
    return new URL(supabaseUrl).host;
  } catch (error) {
    const invalidUrlError = new Error("Invalid NEXT_PUBLIC_SUPABASE_URL");
    invalidUrlError.extra = {
      value: supabaseUrl,
      reason: error instanceof Error ? error.message : String(error),
    };
    throw invalidUrlError;
  }
}

async function assertSupabaseDnsReachable() {
  const host = getSupabaseHost();

  try {
    await lookup(host);
  } catch (error) {
    const dnsError = new Error("Supabase DNS lookup failed");
    dnsError.extra = {
      host,
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
      command: `curl -I https://${host}/auth/v1/health`,
      nextSteps: [
        "현재 네트워크나 DNS에서 Supabase 프로젝트 호스트를 해석할 수 있는지 확인해.",
        "NEXT_PUBLIC_SUPABASE_URL의 project ref가 운영 Supabase ref와 같은지 확인해.",
        "DNS가 정상인 환경에서 이 QA 스크립트를 다시 실행해.",
      ],
    };
    throw dnsError;
  }
}

function getInitialAnalysisPrompt(characterId) {
  if (characterId === "charon_f" || characterId === "jian") {
    if (characterId === "jian") {
      return "내 사주를 바탕으로 재회 가능성과 마음 정리 흐름을 먼저 차분히 정리해줘.";
    }

    return "내 사주를 바탕으로 지금 관계운과 연애에서 조심할 점을 먼저 차분히 정리해줘.";
  }

  if (characterId === "minjun") {
    return "내 사주를 바탕으로 지금 돈 흐름과 수입을 키우는 방향을 먼저 차분히 정리해줘.";
  }

  if (characterId === "seojun") {
    return "내 사주를 바탕으로 지금 커리어 흐름, 일에서 강점과 조심할 점을 먼저 차분히 정리해줘.";
  }

  if (characterId === "doyun") {
    return "내 사주를 바탕으로 지금 사업 흐름, 창업 시기, 의사결정 포인트를 먼저 차분히 정리해줘.";
  }

  if (characterId === "doctor") {
    return "내 사주를 바탕으로 올해 전체 흐름과 건강, 마음 관리 포인트를 먼저 차분히 정리해줘.";
  }

  return "내 사주를 바탕으로 지금 가장 중요한 흐름과 조심할 점, 오늘부터 실천할 조언을 먼저 차분히 정리해줘.";
}

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function extractStreamText(raw) {
  let text = "";
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
    if (!payload || payload === "[DONE]") continue;

    try {
      const parsed = JSON.parse(payload);
      if (parsed.type === "text-delta" && typeof parsed.delta === "string") {
        text += parsed.delta;
      } else if (typeof parsed.text === "string") {
        text += parsed.text;
      }
      continue;
    } catch {
      // AI SDK stream formats differ by version, so fall back to regex below.
    }

    const deltaMatch = payload.match(/"delta"\s*:\s*"((?:\\.|[^"])*)"/);
    if (deltaMatch) text += decodeJsonString(deltaMatch[1]);

    const textMatch = payload.match(/^\d+:"((?:\\.|[^"])*)"$/);
    if (textMatch) text += decodeJsonString(textMatch[1]);
  }

  return text.trim();
}

function evaluateFirstConsultation(text, expectedWords) {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text);
  const hasLightForeign = /(타이밍|루틴|패턴|플랜|체크|밸런스|리스크|포인트)/.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);
  const hasMixedAstrology = /(별자리 데이터|자미두수)/.test(text);
  const hasDenseHanjaTerms = /[\u3400-\u9FFF].{0,80}[\u3400-\u9FFF]/.test(text.slice(0, 200));
  const mentionsConcern = expectedWords.some((word) => text.includes(word));
  const actionParagraph = paragraphs[1] ?? "";
  const hasConcreteAction = /(오늘|오늘은|오늘부터|오늘 당장|오늘 할 일|오늘 해볼 일|오늘 바로).{0,90}(기록|정리|비교|확인|나누|말하기|적어|점검)/.test(actionParagraph);

  return {
    paragraphs: paragraphs.length,
    endsWithQuestion: /[?？]\s*$/.test(text),
    hasSaju: text.includes("사주"),
    hasConcreteAction,
    hasEmoji,
    hasLightForeign,
    hasEnglish,
    hasMixedAstrology,
    hasDenseHanjaTerms,
    mentionsConcern,
    preview: text.slice(0, 180),
  };
}

function assertFirstConsultation(label, text, expectedWords) {
  const result = evaluateFirstConsultation(text, expectedWords);
  assert(result.paragraphs === 2, `${label}: 첫 상담 문단 수가 2가 아님`, result);
  assert(result.endsWithQuestion, `${label}: 마지막 문장이 질문으로 끝나지 않음`, result);
  assert(result.hasSaju, `${label}: 사주 근거가 없음`, result);
  assert(result.hasConcreteAction, `${label}: 오늘 할 구체 행동이 없음`, result);
  assert(!result.hasEmoji, `${label}: 이모지/이모티콘 포함`, result);
  assert(!result.hasLightForeign, `${label}: 가벼운 외래어 포함`, result);
  assert(!result.hasEnglish, `${label}: 영어/영문 약어 포함`, result);
  assert(!result.hasMixedAstrology, `${label}: 혼합 점술 체계 표현 포함`, result);
  assert(!result.hasDenseHanjaTerms, `${label}: 첫 200자 안 한자/전문용어 과다`, result);
  assert(result.mentionsConcern, `${label}: 사용자 고민과 연결되지 않음`, result);
  return result;
}

async function createAuthenticatedCookie() {
  const cookieJar = new Map();
  const supabase = createBrowserClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return [...cookieJar].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          cookieJar.set(name, value);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: qaEmail,
    password: qaPassword,
  });
  assert(!error && data.session, "Supabase browser sign-in failed", error);

  return [...cookieJar]
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");
}

async function postJson(path, body, cookie) {
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    // streaming responses are not JSON.
  }
  return { response, raw, json, durationMs: Date.now() - startedAt };
}

async function createReading({ characterId, concerns, status = "pending", chatUsed = 0 }) {
  const { data, error } = await admin
    .from("saju_readings")
    .insert({
      user_id: createdUserId,
      name: "김하늘",
      gender: "female",
      birth_year: 1994,
      birth_month: 5,
      birth_day: 17,
      birth_hour: 9,
      birth_minute: 30,
      is_lunar: false,
      is_leap_month: false,
      concerns,
      four_pillars: fourPillars,
      five_elements: fiveElements,
      preview_summary: "QA용 사주 요약",
      full_analysis: { summary: "QA용 전체 분석" },
      status,
      chat_used: chatUsed,
      character_id: characterId,
    })
    .select("id")
    .single();
  assert(!error && data?.id, "Reading insert failed", error);
  createdReadingIds.push(data.id);
  return data.id;
}

async function getReading(readingId) {
  const { data, error } = await admin
    .from("saju_readings")
    .select("id,status,chat_used,title")
    .eq("id", readingId)
    .single();
  assert(!error && data, "Reading fetch failed", error);
  return data;
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
    .select("amount,balance_after,type,reading_id,product_type,created_at")
    .eq("user_id", createdUserId)
    .order("created_at", { ascending: true });
  assert(!txError && transactions, "Transaction fetch failed", txError);

  return { balance: stars.balance, transactions };
}

async function getMessages(readingId) {
  const { data, error } = await admin
    .from("saju_chat_messages")
    .select("role,content,character_id,created_at")
    .eq("reading_id", readingId)
    .order("created_at", { ascending: true });
  assert(!error && data, "Message fetch failed", error);
  return data;
}

async function setBalance(balance) {
  const { error } = await admin
    .from("user_stars")
    .update({ balance })
    .eq("user_id", createdUserId);
  assert(!error, "Balance update failed", error);
}

async function run() {
  await assertSupabaseDnsReachable();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: qaEmail,
    password: qaPassword,
    email_confirm: true,
  });
  assert(!createError && created.user?.id, "Auth user create failed", createError);
  createdUserId = created.user.id;

  const cookie = await createAuthenticatedCookie();

  const { error: starInsertError } = await admin
    .from("user_stars")
    .insert({ user_id: createdUserId, balance: 15 });
  assert(!starInsertError, "Initial stars insert failed", starInsertError);

  if (scenario === "free-only") {
    await setBalance(3);
    const freeReadingId = await createReading({
      characterId: "charon_f",
      concerns: ["relationship"],
    });
    const freeChat = await postJson("/api/saju/chat", {
      readingId: freeReadingId,
      characterId: "charon_f",
      messages: [{ role: "user", content: getInitialAnalysisPrompt("charon_f") }],
    }, cookie);
    assert(freeChat.response.status === 200, "Free initial chat failed", {
      status: freeChat.response.status,
      body: freeChat.raw.slice(0, 400),
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const freeMessages = await getMessages(freeReadingId);
    const freeAssistant = freeMessages.find((message) => message.role === "assistant")?.content ?? "";
    const freeStream = extractStreamText(freeChat.raw);
    const freeEval = assertFirstConsultation("free saved assistant", freeAssistant, ["관계", "연애", "마음"]);
    if (freeStream) assertFirstConsultation("free stream assistant", freeStream, ["관계", "연애", "마음"]);
    assert(freeMessages.length === 2, "Free chat persisted unexpected message count", freeMessages);
    assert((await getReading(freeReadingId)).chat_used === 1, "Free chat_used mismatch");

    const starState = await getStarState();
    const chatTx = starState.transactions.filter((tx) => tx.type === "chat_message" && tx.amount === -1);
    assert(chatTx.length === 1, "Free chat transaction count mismatch", starState);
    assert(starState.balance === 2, "Free final star balance mismatch", starState);

    return {
      userId: createdUserId,
      freeReadingId,
      freeEval,
      freeStreamExtracted: Boolean(freeStream),
      freeChatDurationMs: freeChat.durationMs,
      finalBalance: starState.balance,
      transactionTypes: starState.transactions.map((tx) => `${tx.type}:${tx.amount}:${tx.balance_after}`),
    };
  }

  const reportReadingId = await createReading({
    characterId: "doctor",
    concerns: ["health"],
  });

  const forbiddenStatus = await postJson("/api/saju/update-status", {
    readingId: reportReadingId,
    status: "paid",
  }, cookie);
  assert(forbiddenStatus.response.status === 403, "Client paid status transition was not blocked", {
    status: forbiddenStatus.response.status,
    body: forbiddenStatus.raw,
  });
  assert((await getReading(reportReadingId)).status === "pending", "Forbidden status transition changed reading");

  const reportDeduct = await postJson("/api/saju/deduct-stars", {
    readingId: reportReadingId,
  }, cookie);
  assert(reportDeduct.response.status === 200, "Report star deduction failed", {
    status: reportDeduct.response.status,
    body: reportDeduct.raw,
  });
  assert(reportDeduct.json?.balance === 10 && reportDeduct.json?.amount === -5, "Report deduction response mismatch", reportDeduct.json);
  assert((await getReading(reportReadingId)).status === "paid", "Report deduction did not mark reading paid");

  const monthlyFirst = await postJson("/api/monthly-saju/deduct-monthly-report", {}, cookie);
  assert(monthlyFirst.response.status === 200, "Monthly report first deduction failed", {
    status: monthlyFirst.response.status,
    body: monthlyFirst.raw,
  });
  assert(monthlyFirst.json?.balance === 7 && monthlyFirst.json?.amount === -3 && monthlyFirst.json?.alreadyUnlocked === false, "Monthly first response mismatch", monthlyFirst.json);

  const monthlySecond = await postJson("/api/monthly-saju/deduct-monthly-report", {}, cookie);
  assert(monthlySecond.response.status === 200, "Monthly report repeat request failed", {
    status: monthlySecond.response.status,
    body: monthlySecond.raw,
  });
  assert(monthlySecond.json?.balance === 7 && monthlySecond.json?.amount === 0 && monthlySecond.json?.alreadyUnlocked === true, "Monthly repeat response mismatch", monthlySecond.json);

  const paidReadingId = await createReading({
    characterId: "seojun",
    concerns: ["career"],
  });
  const paidPayload = {
    readingId: paidReadingId,
    characterId: "seojun",
    messages: [{ role: "user", content: getInitialAnalysisPrompt("seojun") }],
  };
  const [paidA, paidB] = await Promise.all([
    postJson("/api/saju/chat", paidPayload, cookie),
    postJson("/api/saju/chat", paidPayload, cookie),
  ]);
  const paidResponses = [paidA, paidB].sort((a, b) => a.response.status - b.response.status);
  assert(paidResponses[0].response.status === 200 && paidResponses[1].response.status === 409, "Paid concurrent chat did not return one success and one lock conflict", {
    statuses: [paidA.response.status, paidB.response.status],
    bodies: [paidA.raw.slice(0, 120), paidB.raw.slice(0, 120)],
  });
  await new Promise((resolve) => setTimeout(resolve, 500));

  const paidMessages = await getMessages(paidReadingId);
  const paidAssistant = paidMessages.find((message) => message.role === "assistant")?.content ?? "";
  const paidStream = extractStreamText(paidResponses[0].raw);
  const paidEval = assertFirstConsultation("paid saved assistant", paidAssistant, ["커리어", "일", "강점"]);
  if (paidStream) assertFirstConsultation("paid stream assistant", paidStream, ["커리어", "일", "강점"]);
  assert(paidMessages.length === 2, "Paid chat persisted unexpected message count", paidMessages);
  assert((await getReading(paidReadingId)).chat_used === 1, "Paid chat_used mismatch");

  await setBalance(3);
  const freeReadingId = await createReading({
    characterId: "charon_f",
    concerns: ["relationship"],
  });
  const freeChat = await postJson("/api/saju/chat", {
    readingId: freeReadingId,
    characterId: "charon_f",
    messages: [{ role: "user", content: getInitialAnalysisPrompt("charon_f") }],
  }, cookie);
  assert(freeChat.response.status === 200, "Free initial chat failed", {
    status: freeChat.response.status,
    body: freeChat.raw.slice(0, 400),
  });
  await new Promise((resolve) => setTimeout(resolve, 500));

  const freeMessages = await getMessages(freeReadingId);
  const freeAssistant = freeMessages.find((message) => message.role === "assistant")?.content ?? "";
  const freeStream = extractStreamText(freeChat.raw);
  const freeEval = assertFirstConsultation("free saved assistant", freeAssistant, ["관계", "연애", "마음"]);
  if (freeStream) assertFirstConsultation("free stream assistant", freeStream, ["관계", "연애", "마음"]);
  assert(freeMessages.length === 2, "Free chat persisted unexpected message count", freeMessages);
  assert((await getReading(freeReadingId)).chat_used === 1, "Free chat_used mismatch");

  const starState = await getStarState();
  const reportTx = starState.transactions.filter((tx) => tx.type === "report" && tx.amount === -5);
  const monthlyTx = starState.transactions.filter((tx) => tx.type === "monthly_report" && tx.amount === -3);
  const chatTx = starState.transactions.filter((tx) => tx.type === "chat_message" && tx.amount === -1);
  assert(reportTx.length === 1, "Report transaction count mismatch", starState.transactions);
  assert(monthlyTx.length === 1, "Monthly transaction count mismatch", starState.transactions);
  assert(chatTx.length === 2, "Chat transaction count mismatch", starState.transactions);
  assert(starState.balance === 2, "Final star balance mismatch", starState);

  return {
    userId: createdUserId,
    reportReadingId,
    paidReadingId,
    freeReadingId,
    paidEval,
    freeEval,
    paidStreamExtracted: Boolean(paidStream),
    freeStreamExtracted: Boolean(freeStream),
    paidChatDurationMs: paidResponses[0].durationMs,
    paidConflictDurationMs: paidResponses[1].durationMs,
    freeChatDurationMs: freeChat.durationMs,
    finalBalance: starState.balance,
    transactionTypes: starState.transactions.map((tx) => `${tx.type}:${tx.amount}:${tx.balance_after}`),
  };
}

async function cleanup() {
  if (!createdUserId) return;

  await admin.from("coaching_snapshots").delete().eq("user_id", createdUserId);
  if (createdReadingIds.length > 0) {
    await admin.from("saju_chat_messages").delete().in("reading_id", createdReadingIds);
    await admin.from("saju_readings").delete().in("id", createdReadingIds);
  }
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
