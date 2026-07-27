import dotenv from "dotenv";
import { lookup } from "node:dns/promises";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getInitialAnalysisPrompt } from "../src/lib/saju/initial-analysis-prompts.mjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const repeatCount = Number(process.env.QA_CHARACTER_REPEAT ?? 3);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase env");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const qaEmail = `qa-character-live-${Date.now()}@example.com`;
const qaPassword = `Qa-character-live-${Date.now()}!`;
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

const characters = [
  {
    id: "charon_m",
    name: "현우",
    concerns: ["overall"],
    expectedWords: ["흐름", "조심", "오늘"],
    casual: true,
    fallbackHints: ["큰 결론보다 먼저 흔들리는 선택지를 줄이는 게 중요해"],
  },
  {
    id: "charon_f",
    name: "하나",
    concerns: ["relationship"],
    expectedWords: ["관계", "연애", "마음"],
    casual: false,
    fallbackHints: ["관계 흐름은 마음을 빨리 정하는 것보다"],
  },
  {
    id: "minjun",
    name: "민준",
    concerns: ["money"],
    expectedWords: ["돈", "수입", "지출"],
    casual: true,
    fallbackHints: ["돈은 크게 새는 곳보다"],
  },
  {
    id: "haeun",
    name: "인영",
    concerns: ["timing"],
    expectedWords: ["시기", "이번", "오늘"],
    casual: false,
    fallbackHints: ["이번 주에 결정하거나 미뤄둔 일"],
  },
  {
    id: "jian",
    name: "지안",
    concerns: ["reunion"],
    expectedWords: ["재회", "마음", "연락"],
    casual: false,
    fallbackHints: ["재회와 마음 정리는 상대 마음만"],
  },
  {
    id: "seojun",
    name: "서준",
    concerns: ["career"],
    expectedWords: ["커리어", "일", "강점"],
    casual: true,
    fallbackHints: ["일에서는 버틸 힘과 바꿔야 할 조건"],
  },
  {
    id: "doyun",
    name: "도윤",
    concerns: ["business"],
    expectedWords: ["사업", "창업", "조건"],
    casual: true,
    fallbackHints: ["사업은 아이디어보다 조건을 먼저 봐야"],
  },
];

function assert(condition, message, extra = undefined) {
  if (!condition) {
    const error = new Error(message);
    error.extra = extra;
    throw error;
  }
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return sorted[index];
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

function evaluateFirstConsultation(text, expectedWords, casual) {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text);
  const hasLightForeign = /(타이밍|루틴|패턴|플랜|체크|밸런스|리스크|포인트|아웃풋)/.test(text);
  const hasEnglish = /[A-Za-z]/.test(text);
  const hasMixedAstrology = /(별자리 데이터|자미두수|서양 점성술)/.test(text.slice(0, 260));
  const hasDenseHanjaTerms = /[\u3400-\u9FFF].{0,80}[\u3400-\u9FFF]/.test(text.slice(0, 200));
  const hasAwkwardPhrase = /(지금은 지금|관계의 거리을)/.test(text);
  const toneFailures = casual && /(습니다|어요|세요|드립니다|합니다|해보세요|싶나요)/.test(text)
    ? ["casual_character_used_polite_ending"]
    : [];
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
    hasAwkwardPhrase,
    toneFailures,
    mentionsConcern,
    preview: text.slice(0, 180),
  };
}

function assertFirstConsultation(label, text, character) {
  const result = evaluateFirstConsultation(text, character.expectedWords, character.casual);
  assert(result.paragraphs === 2, `${label}: 첫 상담 문단 수가 2가 아님`, result);
  assert(result.endsWithQuestion, `${label}: 마지막 문장이 질문으로 끝나지 않음`, result);
  assert(result.hasSaju, `${label}: 사주 근거가 없음`, result);
  assert(result.hasConcreteAction, `${label}: 오늘 할 구체 행동이 없음`, result);
  assert(!result.hasEmoji, `${label}: 이모지/이모티콘 포함`, result);
  assert(!result.hasLightForeign, `${label}: 가벼운 외래어 포함`, result);
  assert(!result.hasEnglish, `${label}: 영어/영문 약어 포함`, result);
  assert(!result.hasMixedAstrology, `${label}: 혼합 점술 체계 표현 포함`, result);
  assert(!result.hasDenseHanjaTerms, `${label}: 첫 200자 안 한자/전문용어 과다`, result);
  assert(!result.hasAwkwardPhrase, `${label}: 알려진 어색한 문장 포함`, result);
  assert(result.toneFailures.length === 0, `${label}: 말투 혼합`, result);
  assert(result.mentionsConcern, `${label}: 사용자 고민과 연결되지 않음`, result);
  return result;
}

function looksLikeFallback(text, character) {
  return character.fallbackHints.some((hint) => text.includes(hint));
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
  return { response, raw, durationMs: Date.now() - startedAt };
}

async function createReading(character) {
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
      concerns: character.concerns,
      four_pillars: fourPillars,
      five_elements: fiveElements,
      preview_summary: "QA용 사주 요약",
      full_analysis: { summary: "QA용 전체 분석" },
      status: "pending",
      chat_used: 0,
      character_id: character.id,
    })
    .select("id")
    .single();
  assert(!error && data?.id, "Reading insert failed", error);
  createdReadingIds.push(data.id);
  return data.id;
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

async function getReading(readingId) {
  const { data, error } = await admin
    .from("saju_readings")
    .select("id,chat_used")
    .eq("id", readingId)
    .single();
  assert(!error && data, "Reading fetch failed", error);
  return data;
}

async function runCharacterCase(character, iteration, cookie) {
  console.error(`[qa:characters] start ${character.id} ${iteration}/${repeatCount}`);
  const readingId = await createReading(character);
  const chat = await postJson("/api/saju/chat", {
    readingId,
    characterId: character.id,
    messages: [{ role: "user", content: getInitialAnalysisPrompt(character.id) }],
  }, cookie);

  if (chat.response.status !== 200) {
    console.error(`[qa:characters] fail ${character.id} ${iteration}/${repeatCount} status=${chat.response.status} durationMs=${chat.durationMs}`);
    return {
      characterId: character.id,
      characterName: character.name,
      iteration,
      ok: false,
      status: chat.response.status,
      durationMs: chat.durationMs,
      error: "chat_status_not_200",
      body: chat.raw.slice(0, 400),
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const messages = await getMessages(readingId);
  const assistantText = messages.find((message) => message.role === "assistant")?.content ?? "";
  const streamText = extractStreamText(chat.raw);

  try {
    const savedEval = assertFirstConsultation(`${character.id} saved assistant ${iteration}`, assistantText, character);
    const streamEval = streamText
      ? assertFirstConsultation(`${character.id} stream assistant ${iteration}`, streamText, character)
      : null;
    const reading = await getReading(readingId);
    assert(messages.length === 2, `${character.id}: persisted unexpected message count`, messages);
    assert(reading.chat_used === 1, `${character.id}: chat_used mismatch`, reading);

    console.error(`[qa:characters] pass ${character.id} ${iteration}/${repeatCount} durationMs=${chat.durationMs}`);
    return {
      characterId: character.id,
      characterName: character.name,
      iteration,
      ok: true,
      status: chat.response.status,
      durationMs: chat.durationMs,
      slowOver30s: chat.durationMs > 30_000,
      streamExtracted: Boolean(streamText),
      usedFallbackLikely: looksLikeFallback(assistantText, character),
      savedEval,
      streamEval,
    };
  } catch (error) {
    console.error(`[qa:characters] fail ${character.id} ${iteration}/${repeatCount} status=${chat.response.status} durationMs=${chat.durationMs}`);
    return {
      characterId: character.id,
      characterName: character.name,
      iteration,
      ok: false,
      status: chat.response.status,
      durationMs: chat.durationMs,
      slowOver30s: chat.durationMs > 30_000,
      streamExtracted: Boolean(streamText),
      usedFallbackLikely: looksLikeFallback(assistantText, character),
      error: error.message,
      extra: error.extra,
      preview: assistantText.slice(0, 240),
    };
  }
}

function summarize(results) {
  const byCharacter = {};
  for (const character of characters) {
    const rows = results.filter((row) => row.characterId === character.id);
    const durations = rows.map((row) => row.durationMs);
    const fallbackCount = rows.filter((row) => row.usedFallbackLikely).length;
    const failures = rows.filter((row) => !row.ok);
    byCharacter[character.id] = {
      name: character.name,
      total: rows.length,
      passed: rows.length - failures.length,
      failed: failures.length,
      fallbackCount,
      slowOver30sCount: rows.filter((row) => row.durationMs > 30_000).length,
      minDurationMs: Math.min(...durations),
      p50DurationMs: percentile(durations, 0.5),
      p95DurationMs: percentile(durations, 0.95),
      maxDurationMs: Math.max(...durations),
      toneFailures: rows
        .flatMap((row) => row.savedEval?.toneFailures ?? row.extra?.toneFailures ?? [])
        .filter(Boolean),
    };
  }

  const allDurations = results.map((row) => row.durationMs);
  return {
    total: results.length,
    passed: results.filter((row) => row.ok).length,
    failed: results.filter((row) => !row.ok).length,
    latencySummary: {
      p50DurationMs: percentile(allDurations, 0.5),
      p95DurationMs: percentile(allDurations, 0.95),
      maxDurationMs: Math.max(...allDurations),
      slowOver30sCount: results.filter((row) => row.durationMs > 30_000).length,
    },
    fallbackSummary: {
      count: results.filter((row) => row.usedFallbackLikely).length,
      byCharacter: Object.fromEntries(
        characters.map((character) => [
          character.id,
          results.filter((row) => row.characterId === character.id && row.usedFallbackLikely).length,
        ]),
      ),
    },
    byCharacter,
    failures: results.filter((row) => !row.ok),
  };
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
    .insert({ user_id: createdUserId, balance: characters.length * repeatCount + 5 });
  assert(!starInsertError, "Initial stars insert failed", starInsertError);

  const results = [];
  for (const character of characters) {
    for (let iteration = 1; iteration <= repeatCount; iteration += 1) {
      results.push(await runCharacterCase(character, iteration, cookie));
    }
  }

  const summary = summarize(results);
  assert(summary.failed === 0, "Character live QA failed", summary);
  return {
    userId: createdUserId,
    repeatCount,
    summary,
    results,
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
