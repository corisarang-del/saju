import { describe, expect, it } from "vitest";
import { CHARACTER_LIST, CHARACTERS, getCharacter } from "./characters";

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

  it("renames_haeun_to_inyoung_without_changing_the_stored_character_id", () => {
    const inyoung = CHARACTERS.haeun;
    const visibleNames = CHARACTER_LIST.map((character) => character.name);

    expect(inyoung).toMatchObject({
      id: "haeun",
      name: "인영",
      avatar: "/characters/haeun-premium.png",
      cardImage: "/characters/haeun-premium.png",
    });
    expect(getCharacter("haeun").name).toBe("인영");
    expect(visibleNames).toContain("인영");
    expect(visibleNames).not.toContain("하은");
    expect(inyoung.freePrompt).toContain("넌 '인영'이야");
    expect(inyoung.paidPrompt).toContain("넌 '인영'이야");
    expect(inyoung.freePrompt).not.toContain("넌 '하은'이야");
    expect(inyoung.paidPrompt).not.toContain("넌 '하은'이야");
  });

  it("keeps_inyoung_first_response_easy_without_front_loaded_hanja_terms", () => {
    const inyoung = CHARACTERS.haeun;
    const prompts = [inyoung.freePrompt, inyoung.paidPrompt].join("\n");

    expect(prompts).toContain("첫 상담에서는 한자 병기와 어려운 사주 용어를 앞에 꺼내지 마");
    expect(prompts).toContain("2026년, 이번 달, 이번 주를 쉬운 말로 나누어");
    expect(prompts).not.toContain("2026년(병오년, 丙午年)");
    expect(prompts).not.toContain("올해 병오(丙午)년은");
    expect(prompts).not.toContain("편재(偏財, 한방 수입)");
  });

  it("keeps_character_tone_profiles_structured_by_consultation_role", () => {
    expect(CHARACTERS.charon_m.toneProfile.answerPattern).toEqual([
      "핵심 판단",
      "주의할 흐름",
      "좋은 흐름",
      "오늘 바로 할 행동",
    ]);
    expect(CHARACTERS.charon_f.toneProfile.preferredPhrases).toEqual(
      expect.arrayContaining(["마음의 속도", "대화 온도", "표현 방식"]),
    );
    expect(CHARACTERS.minjun.toneProfile.answerPattern).toEqual(
      expect.arrayContaining(["돈이 새는 구멍", "이번 달 관리 기준"]),
    );
    expect(CHARACTERS.haeun.toneProfile.answerPattern).toEqual(
      expect.arrayContaining(["좋은 시기", "피하면 좋은 시기", "미리 준비할 것"]),
    );
    expect(CHARACTERS.jian.toneProfile.answerPattern).toEqual(
      expect.arrayContaining(["다시 잡아도 되는지", "연락하거나 멈출 기준"]),
    );
    expect(CHARACTERS.seojun.toneProfile.answerPattern).toEqual(
      expect.arrayContaining(["지금 버틸 조건", "움직여도 되는 조건"]),
    );
    expect(CHARACTERS.doyun.toneProfile.answerPattern).toEqual(
      expect.arrayContaining(["사람/돈/시기 리스크", "확장 또는 보류 기준"]),
    );
  });

  it("injects_character_tone_profiles_into_final_prompts_without_pressure_words", () => {
    const finalPrompts = CHARACTER_LIST.map((character) =>
      [character.name, character.freePrompt, character.paidPrompt].join("\n"),
    ).join("\n");

    expect(finalPrompts).toContain("## 캐릭터별 답변 구조");
    expect(finalPrompts).toContain("좋은 시기 → 피하면 좋은 시기 → 미리 준비할 것");
    expect(finalPrompts).toContain("다시 만나도 덜 다칠 조건");
    expect(finalPrompts).toContain("버틸 조건");
    expect(finalPrompts).toContain("현금흐름");
    expect(finalPrompts).not.toContain("하은");
    expect(finalPrompts).not.toMatch(/돈 냄새|놓치면 안 돼|무조건|반드시|위험 경고|이 날 놓치면/);
  });
});
