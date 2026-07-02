import { describe, expect, it } from "vitest";
import { CHARACTER_LIST, CHARACTERS } from "./characters";

describe("CHARACTER_LIST", () => {
  it("keeps_direct_characters_soft_enough_for_women_customers", () => {
    const prompts = CHARACTER_LIST.map((character) =>
      [character.description, character.quote, character.freePrompt, character.paidPrompt].join(
        "\n",
      ),
    ).join("\n");

    expect(prompts).toContain("직설적이어도 무례하게 말하지 마");
    expect(prompts).not.toMatch(/(^|[\s"'“])니(?=[\s"'”])/m);
    expect(prompts).not.toContain("어이, 동생");
    expect(prompts).not.toContain("당하는 거야");
  });

  it("keeps_raw_character_prompts_free_from_dismissive_addressing", () => {
    const rawPrompts = Object.values(CHARACTERS)
      .map((character) =>
        [
          character.description,
          character.quote,
          character.freePrompt,
          character.paidPrompt,
        ].join("\n"),
      )
      .join("\n");

    expect(rawPrompts).not.toMatch(/(^|[\s"'“])니(?=[\s"'”])/m);
    expect(rawPrompts).not.toMatch(/(^|[\s"'“])니가/m);
    expect(rawPrompts).not.toContain("니 사주");
    expect(rawPrompts).not.toMatch(/(^|[\s"'“])형이/m);
    expect(rawPrompts).not.toContain("형우 씨");
    expect(rawPrompts).not.toContain("어이 동생");
    expect(rawPrompts).not.toContain("당하는 거야");
  });

  it("keeps_character_copy_free_from_pressure_marketing_language", () => {
    const rawPrompts = Object.values(CHARACTERS)
      .map((character) =>
        [
          character.description,
          character.quote,
          character.freePrompt,
          character.paidPrompt,
        ].join("\n"),
      )
      .join("\n");
    const finalPrompts = CHARACTER_LIST.map((character) =>
      [character.description, character.quote, character.freePrompt, character.paidPrompt].join(
        "\n",
      ),
    ).join("\n");

    for (const content of [rawPrompts, finalPrompts]) {
      expect(content).not.toContain("돈 냄새");
      expect(content).not.toContain("놓치면 안 돼");
      expect(content).not.toContain("꼭 기억하셔야 해요");
      expect(content).not.toContain("놓치면 3년을 더 돌아가");
      expect(content).not.toContain("무조건 혼자 해야");
      expect(content).toContain("돈 흐름");
      expect(content).toContain("챙겨보면 도움 돼");
      expect(content).toContain("기억해두면 좋아요");
    }
  });

  it("keeps_character_copy_free_from_korean_replacement_artifacts", () => {
    const content = Object.values(CHARACTERS)
      .map((character) =>
        [
          character.description,
          character.quote,
          character.freePrompt,
          character.paidPrompt,
        ].join("\n"),
      )
      .join("\n");

    expect(content).not.toMatch(/덩그러네|언네|선배이|장인내가|유내가/);
    expect(content).toContain("한자만 덩그러니 던지면 안 돼");
    expect(content).toContain("언니가 진심으로");
    expect(content).toContain("선배가 후배한테");
    expect(content).toContain("한 분야 장인형이야");
    expect(content).toContain("사람 유형이 있거든");
  });

  it("keeps_hyunwoo_direct_but_not_threatening_for_women_customers", () => {
    const hyunwoo = CHARACTERS.charon_m;
    const content = [
      hyunwoo.description,
      hyunwoo.quote,
      hyunwoo.tags.join("\n"),
      hyunwoo.freePrompt,
      hyunwoo.paidPrompt,
    ].join("\n");

    expect(hyunwoo.description).toContain("좋은 흐름과 주의할 흐름");
    expect(hyunwoo.quote).toContain("미리 알면 덜 흔들리는 흐름");
    expect(hyunwoo.tags).toContain("차분한 직설");
    expect(hyunwoo.tags).toContain("주의 포인트");
    expect(content).not.toMatch(/위험 경고|미리 알아야 해|좀 위험|경고부터|위험한 건 먼저|겁주/);
    expect(content).not.toContain("이거 모르고 지나가면 나중에 후회할 수 있어");
    expect(content).toContain("직설적이어도 무례하게 말하지 마");
  });
});
