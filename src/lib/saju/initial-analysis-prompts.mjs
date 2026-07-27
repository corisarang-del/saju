export function getInitialAnalysisPrompt(characterId) {
  if (characterId === "charon_f" || characterId === "jian") {
    if (characterId === "jian") {
      return "내 사주를 바탕으로 재회 가능성과 마음 정리 흐름을 먼저 차분히 정리해줘.";
    }

    return "내 정보와 상대방 정보를 함께 바탕으로 두 사람의 관계와 궁합 흐름, 잘 맞는 부분, 조심할 점을 먼저 차분히 정리해줘.";
  }

  if (characterId === "minjun") {
    return "내 사주를 바탕으로 지금 돈 흐름과 수입을 키우는 방향을 먼저 차분히 정리해줘.";
  }

  if (characterId === "seojun") {
    return "내 사주를 바탕으로 지금 커리어 흐름, 일에서 강점과 조심할 점을 먼저 차분히 정리해줘.";
  }

  if (characterId === "haeun") {
    return "내 사주를 바탕으로 2026년 흐름과 이번 달, 이번 주에 좋은 시기와 피하면 좋은 시기, 오늘 할 행동을 먼저 차분히 정리해줘.";
  }

  if (characterId === "doyun") {
    return "내 사주를 바탕으로 지금 사업 흐름, 창업 시기, 의사결정 포인트를 먼저 차분히 정리해줘.";
  }

  if (characterId === "doctor") {
    return "내 사주를 바탕으로 올해 전체 흐름과 건강, 마음 관리 포인트를 먼저 차분히 정리해줘.";
  }

  return "내 사주를 바탕으로 지금 가장 중요한 흐름과 조심할 점, 오늘부터 실천할 조언을 먼저 차분히 정리해줘.";
}
