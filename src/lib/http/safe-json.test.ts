import { describe, expect, it } from "vitest";
import { safeJson } from "./safe-json";

describe("safeJson", () => {
  it("returns_structured_bad_request_when_body_is_not_json", async () => {
    const request = new Request("https://monthlysaju.test/api/saju/chat", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "not-json",
    });

    const result = await safeJson(request, {
      requestId: "req_123",
      source: "test",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.response.status).toBe(400);
    await expect(result.response.json()).resolves.toEqual({
      error: "invalid_json",
      message: "요청 본문은 올바른 JSON이어야 해.",
      requestId: "req_123",
    });
  });

  it("parses_valid_json_when_body_is_json", async () => {
    const request = new Request("https://monthlysaju.test/api/saju/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ readingId: "reading_123" }),
    });

    await expect(safeJson<{ readingId: string }>(request)).resolves.toEqual({
      ok: true,
      data: { readingId: "reading_123" },
    });
  });
});
