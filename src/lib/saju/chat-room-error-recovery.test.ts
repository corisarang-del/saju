import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("chat_room_error_recovery", () => {
  it("shows_chat_generation_errors_and_allows_initial_analysis_retry", () => {
    const content = readProjectFile("src/components/saju/chat/ChatRoom.tsx");

    expect(content).toContain("onError:");
    expect(content).toContain("setChatError");
    expect(content).toContain("window.sessionStorage.removeItem(autoStartKey)");
    expect(content).toContain("분석을 시작하지 못했어");
  });

  it("logs_streaming_errors_on_the_chat_api_boundary", () => {
    const content = readProjectFile("src/app/api/saju/chat/route.ts");

    expect(content).toContain("onError");
    expect(content).toContain("[saju/chat] stream error");
  });
});
