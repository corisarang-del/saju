import { describe, expect, it } from "vitest";
import {
  getInitialAnalysisQualityReport,
  getChatCompletionFailureMessage,
  shouldPersistAssistantAnswer,
} from "./chat-completion-guard";

describe("chat_completion_guard", () => {
  it("rejects_partial_answers_when_stream_finished_with_error", () => {
    const result = {
      assistantText: "현철 씨, 사",
      finishReason: "error",
      isError: true,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_partial_answers_when_stream_reaches_output_token_limit", () => {
    const result = {
      assistantText:
        "자미두수로 보면 현철 씨의 부처궁에 천기성이 들어와 있어서 관계 흐름이 섬세하게 움직이는 편이고, 지금 대한의 명궁에는 자미성과 천상성이 함께 있어 사회",
      finishReason: "length",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_too_short_initial_analysis_even_when_stream_reports_stop", () => {
    const result = {
      assistantText: "현철 씨, 사",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("allows_short_follow_up_answers_when_they_are_not_initial_analysis", () => {
    const result = {
      assistantText: "응, 맞아.",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: false,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBeNull();
    expect(shouldPersistAssistantAnswer(result)).toBe(true);
  });

  it("rejects_empty_follow_up_answers_as_failed_generation", () => {
    const result = {
      assistantText: "",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: false,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("allows_substantial_initial_analysis_answers", () => {
    const result = {
      assistantText:
        "현철 씨, 사주 흐름으로 보면 지금은 마음을 차분히 정리하면서 생활 리듬을 다시 세우는 흐름이 강해요.\n\n오늘은 큰 결정보다 해야 할 일을 세 가지로 나누기부터 해보면 좋아요. 지금 제일 먼저 정리하고 싶은 건 일이에요, 관계예요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBeNull();
    expect(shouldPersistAssistantAnswer(result)).toBe(true);
  });

  it("rejects_initial_analysis_unless_it_has_exactly_two_paragraphs", () => {
    const cases = [
      "현철 씨, 사주 흐름으로 보면 지금은 마음을 차분히 정리하면서 생활 리듬을 다시 세우는 흐름이 강해요. 오늘은 큰 결정보다 해야 할 일을 세 가지로 나누기부터 해보면 좋아요. 지금 제일 먼저 정리하고 싶은 건 일이에요, 관계예요?",
      "현철 씨, 사주 흐름으로 보면 지금은 선택을 줄여야 하는 시기예요.\n\n오늘은 지출을 정리해보세요.\n\n가장 먼저 확인하고 싶은 부분은 돈 흐름이에요?",
    ];

    for (const assistantText of cases) {
      expect(shouldPersistAssistantAnswer({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe(false);
    }
  });

  it("rejects_initial_analysis_with_more_than_three_paragraphs_before_persisting", () => {
    const result = {
      assistantText:
        "현철 씨, 사주 흐름으로 보면 지금은 선택을 줄여야 하는 시기예요.\n\n첫째 문단이에요.\n\n둘째 문단이에요.\n\n셋째 문단이에요.\n\n오늘은 지출을 정리해보세요. 가장 먼저 확인하고 싶은 부분은 돈 흐름이에요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "첫 상담 응답 형식이 맞지 않아 다시 분석해줘. 별은 차감하지 않았어.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_initial_analysis_with_emoji_before_persisting", () => {
    const result = {
      assistantText:
        "현철 씨, 사주 흐름으로 보면 지금은 돈 흐름을 정리해야 하는 시기예요. 🔥\n\n오늘은 최근 지출을 항목별로 기록해보세요. 먼저 수입과 지출 중 어디부터 볼까요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "첫 상담 응답 형식이 맞지 않아 다시 분석해줘. 별은 차감하지 않았어.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_initial_analysis_that_does_not_end_with_a_question", () => {
    const result = {
      assistantText:
        "현철 씨, 사주 흐름으로 보면 지금은 몸과 마음을 먼저 돌봐야 하는 시기예요.\n\n오늘은 피곤했던 순간을 짧게 기록해보세요. 내일부터 천천히 보면 돼요.",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_initial_analysis_without_saju_grounding_or_concrete_today_action", () => {
    const result = {
      assistantText:
        "소민님, 최근 연락이 애매해진 관계 때문에 마음이 복잡하시군요. 지금은 서로 거리를 두며 마음을 살피는 흐름이에요.\n\n오늘은 마음이 편안해지는 활동을 하나 해보세요. 상대방과 다시 이어질지 더 볼까요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_initial_analysis_when_today_action_is_not_in_the_action_paragraph", () => {
    const result = {
      assistantText:
        "소민님, 오늘부터 관계를 차분히 봐야 하는 흐름이에요. 사주 흐름으로 보면 마음을 빨리 정하기보다 기준을 세워야 안정되는 시기예요.\n\n상대방과의 마지막 대화를 떠올려보면 앞으로 방향을 잡는 데 도움이 될 거예요. 지금 가장 확인하고 싶은 마음은 무엇인가요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("reports_initial_analysis_quality_reasons_for_structured_server_logs", () => {
    const assistantText =
      "소민님, 오늘부터 관계를 차분히 봐야 하는 흐름이에요. 사주 흐름으로 보면 마음을 빨리 정하기보다 기준을 세워야 안정되는 시기예요.\n\n상대방과의 마지막 대화를 떠올려보면 앞으로 방향을 잡는 데 도움이 될 거예요. 지금 가장 확인하고 싶은 마음은 무엇인가요?";

    expect(getInitialAnalysisQualityReport(assistantText)).toEqual({
      paragraphCount: 2,
      endsWithQuestion: true,
      hasSajuGrounding: true,
      hasConcreteTodayAction: false,
      hasEmoji: false,
      hasEnglish: false,
      hasBlockedPattern: false,
      hasDenseHanjaTerms: false,
      isValid: false,
    });
  });

  it("rejects_initial_analysis_with_generic_blocked_phrases_even_when_other_shape_passes", () => {
    const cases = [
      "다은님, 사주 흐름으로 보면 돈이 들어오는 길목과 나가는 길목을 같이 봐야 하는 시기예요. 마치 물이 새는 주머니처럼 보일 수 있지만 차분히 정리하면 돼요.\n\n오늘은 지난 한 달 지출을 기록하고 정리해보세요. 먼저 가장 많이 쓴 항목은 무엇인가요?",
      "하린님, 사주 흐름으로 보면 지금은 사업을 시작하기에 나쁘지 않은 시기예요. 주변 의견을 무조건 따르기보다 기준을 세워야 해요.\n\n오늘은 사업 조건을 세 가지로 나누어 정리해보세요. 가장 먼저 확인할 조건은 무엇인가요?",
    ];

    for (const assistantText of cases) {
      expect(shouldPersistAssistantAnswer({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe(false);
    }
  });

  it("rejects_initial_analysis_with_near_miss_metaphor_marker_or_generic_reassurance", () => {
    const cases = [
      "다은님, 사주 흐름으로 보면 재물운은 있지만 마치 물이 조금씩 새는 주머니처럼 지출이 흩어지는 시기예요.\n\n오늘은 지난 한 달 지출을 기록하고 정리해보세요. 먼저 가장 많이 쓴 항목은 무엇인가요?",
      "하린님, [사주] 흐름으로 보면 새 출발의 기운과 조심할 점이 같이 보여요.\n\n오늘은 사업 계획을 세 가지로 나누어 정리해보세요. 가장 먼저 확인하고 싶은 부분은 무엇인가요?",
      "다은님, 사주 흐름으로 보면 돈이 나가는 길목을 차분히 봐야 하는 시기예요. 하지만 걱정 마세요.\n\n오늘은 지난 한 달 지출을 기록하고 정리해보세요. 먼저 가장 많이 쓴 항목은 무엇인가요?",
    ];

    for (const assistantText of cases) {
      expect(shouldPersistAssistantAnswer({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe(false);
    }
  });

  it("rejects_initial_analysis_with_markdown_or_guidance_style_closing", () => {
    const cases = [
      "하린님, 사주 흐름으로 보면 지금은 사업 계획을 세밀하게 다듬어야 하는 시기예요.\n\n오늘은 사업 아이디어를 **세 가지 항목으로 정리**해보세요. 가장 먼저 확인하고 싶은 위험 요소는 무엇인가요?",
      "유진님, 사주 흐름으로 보면 지금은 급한 이직보다 현재 불만을 정리해야 하는 시기예요.\n\n오늘은 회사에서 겪는 어려움 세 가지를 기록해보세요. 다음 질문에 답해주시면 더 깊이 이야기 나눌 수 있습니다.",
    ];

    for (const assistantText of cases) {
      expect(shouldPersistAssistantAnswer({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe(false);
    }
  });

  it("rejects_initial_analysis_with_light_foreign_words_before_persisting", () => {
    const cases = [
      "소민님, 사주 흐름으로 보면 지금은 관계에서 소통의 방식과 타이밍을 차분히 살펴야 하는 시기예요.\n\n오늘은 먼저 보내고 싶은 말을 기록하고 정리해보세요. 지금 가장 확인하고 싶은 건 상대의 마음이에요, 다시 연락할 시점이에요?",
      "하린님, 사주 흐름으로 보면 사업 방향을 다시 확인해야 하는 시기예요.\n\n오늘은 아이디어를 세 가지로 체크하고 정리해보세요. 가장 먼저 확인하고 싶은 위험 요소는 무엇인가요?",
      "유진님, 사주 흐름으로 보면 일의 부담을 줄이고 생활 리듬을 다시 세워야 하는 시기예요.\n\n오늘은 퇴근 뒤 해야 할 일을 둘로 나누어 플랜을 적어보세요. 지금 제일 무거운 업무는 무엇인가요?",
      "지우님, 사주 흐름으로 보면 몸과 마음의 루틴을 다시 세워야 하는 시기예요.\n\n오늘은 피로가 커진 순간을 시간대별로 기록해보세요. 지금 가장 먼저 확인하고 싶은 몸 상태는 무엇인가요?",
      "하린님, 사주 흐름으로 보면 사업 리스크를 차분히 줄여야 하는 시기예요.\n\n오늘은 창업 조건을 세 가지로 정리해보세요. 가장 먼저 확인하고 싶은 조건은 무엇인가요?",
    ];

    for (const assistantText of cases) {
      expect(shouldPersistAssistantAnswer({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe(false);
    }
  });

  it("rejects_initial_analysis_with_mixed_astrology_or_dense_hanja_terms", () => {
    const cases = [
      "하늘 씨, 사주와 별자리 데이터를 보니 지금 관계에서 신중하게 살펴볼 부분이 보여요. 사주 흐름으로 보면 마음을 빨리 정하기보다 상대의 반응을 확인해야 하는 시기예요.\n\n오늘은 최근 대화에서 마음이 흔들린 문장을 기록하고 정리해보세요. 먼저 확인하고 싶은 건 상대 마음이에요, 내 선택이에요?",
      "하늘 씨, 자미두수로 보면 관계 흐름이 섬세하게 움직이고 있어요. 사주 흐름으로 보면 지금은 감정의 속도를 낮추고 내 기준을 먼저 세워야 하는 시기예요.\n\n오늘은 상대에게 바라는 조건을 세 가지로 기록하고 정리해보세요. 먼저 확인하고 싶은 건 연락 흐름이에요, 마음 정리예요?",
      "하늘 씨, 2026년 丙午에는 화(火) 기운과 정관(正官)이 같이 들어와 관계 판단이 예민해질 수 있어요. 사주 흐름으로 보면 지금은 결론보다 기준을 먼저 세워야 하는 시기예요.\n\n오늘은 상대에게 기대하는 말과 내가 실제로 받은 말을 나누어 기록해보세요. 먼저 확인하고 싶은 건 상대 마음이에요, 내 기준이에요?",
    ];

    for (const assistantText of cases) {
      expect(getChatCompletionFailureMessage({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe("첫 상담 응답 형식이 맞지 않아 다시 분석해줘. 별은 차감하지 않았어.");
      expect(shouldPersistAssistantAnswer({
        assistantText,
        finishReason: "stop",
        isError: false,
        isInitialAnalysis: true,
      })).toBe(false);
    }
  });

  it("rejects_initial_analysis_with_missing_name_honorific_before_persisting", () => {
    const result = {
      assistantText:
        "유진님, 지금 이직과 퇴사 사이에서 마음이 흔들리는 시기예요. 님의 사주 흐름으로 보면 변화 욕구가 커지지만 기준을 먼저 세워야 해요.\n\n오늘은 회사에서 힘든 점과 바라는 점을 각각 세 가지로 기록해보세요. 지금 제일 크게 망설이는 부분은 무엇인가요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("rejects_initial_analysis_with_english_letters_before_persisting", () => {
    const result = {
      assistantText:
        "하린님, 사주 흐름으로 보면 지금은 사업 방향을 차분히 정리해야 하는 시기예요. SWOT 관점처럼 나누어 보기보다 실제 조건을 먼저 봐야 해요.\n\n오늘은 창업 조건을 세 가지로 기록하고 정리해보세요. 가장 먼저 확인하고 싶은 조건은 무엇인가요?",
      finishReason: "stop",
      isError: false,
      isInitialAnalysis: true,
    } as const;

    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });

  it("preserves_provider_quota_message_when_error_stream_contains_user_facing_text", () => {
    const result = {
      assistantText: "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.",
      finishReason: "error",
      isError: true,
      isInitialAnalysis: true,
    } as const;

    expect(getChatCompletionFailureMessage(result)).toBe(
      "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.",
    );
    expect(shouldPersistAssistantAnswer(result)).toBe(false);
  });
});
