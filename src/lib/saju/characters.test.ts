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

  it("keeps_character_copy_aligned_with_first_consultation_foreign_word_rules", () => {
    const rawPrompts = Object.values(CHARACTERS)
      .map((character) =>
        [
          character.description,
          character.quote,
          character.tags.join("\n"),
          character.service,
          character.freePrompt,
          character.paidPrompt,
        ].join("\n"),
      )
      .join("\n");
    const finalPrompts = CHARACTER_LIST.map((character) =>
      [
        character.description,
        character.quote,
        character.tags.join("\n"),
        character.service,
        character.freePrompt,
        character.paidPrompt,
      ].join("\n"),
    ).join("\n");

    expect(rawPrompts).not.toContain("타이밍");
    expect(finalPrompts).not.toContain("타이밍");
    expect(finalPrompts).not.toMatch(/시기이야|시기을|체크/);
    expect(finalPrompts).toContain("시기");
  });

  it("keeps_sensitive_character_card_quotes_calm_and_natural_for_women_customers", () => {
    expect(CHARACTERS.jian.quote).not.toContain("근데 문제는");
    expect(CHARACTERS.jian.quote).toContain("차분히");
    expect(CHARACTERS.seojun.quote).not.toContain("커리어는 시기야");
    expect(CHARACTERS.seojun.quote).toContain("커리어 흐름");
    expect(CHARACTERS.doyun.quote).not.toContain("사업은 시기야");
    expect(CHARACTERS.doyun.quote).toContain("사업 흐름");
  });

  it("keeps_character_prompts_free_from_emoji_examples_that_can_leak_into_first_answers", () => {
    const rawPrompts = Object.values(CHARACTERS)
      .map((character) => [character.freePrompt, character.paidPrompt].join("\n"))
      .join("\n");

    expect(rawPrompts).not.toMatch(/\p{Extended_Pictographic}/u);
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
