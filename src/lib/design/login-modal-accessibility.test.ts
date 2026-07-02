import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("login_modal_accessibility", () => {
  it("exposes_the_character_login_prompt_as_an_accessible_dialog", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-labelledby="character-login-title"');
    expect(content).toContain('aria-describedby="character-login-description"');
    expect(content).toContain('id="character-login-title"');
    expect(content).toContain('id="character-login-description"');
    expect(content).toContain('aria-label="Google로 로그인하고 상담 시작하기"');
    expect(content).toContain('aria-label="로그인 안내 닫기"');
  });

  it("keeps_keyboard_focus_inside_the_dialog_and_restores_the_trigger", () => {
    const content = readProjectFile("src/components/saju/landing/CharacterCards.tsx");

    expect(content).toContain("triggerRef");
    expect(content).toContain("dialogRef");
    expect(content).toContain("focusableSelectors");
    expect(content).toContain("event.key === \"Tab\"");
    expect(content).toContain("event.shiftKey");
    expect(content).toContain("!dialog.contains(document.activeElement)");
    expect(content).toContain("event.key === \"Escape\"");
    expect(content).toContain("const trigger = triggerRef.current");
    expect(content).toContain("trigger?.focus()");
    expect(content).toContain("firstFocusable?.focus()");
  });
});
