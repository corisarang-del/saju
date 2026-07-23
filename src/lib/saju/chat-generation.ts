export function getChatMaxOutputTokens({
  isFirstAssistantTurn = false,
  isFree,
}: {
  isFirstAssistantTurn?: boolean;
  isFree: boolean;
}): number {
  if (isFirstAssistantTurn) {
    return 1200;
  }

  return isFree ? 4000 : 10000;
}
