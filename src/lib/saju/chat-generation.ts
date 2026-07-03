export function getChatMaxOutputTokens({
  isFirstAssistantTurn = false,
  isFree,
}: {
  isFirstAssistantTurn?: boolean;
  isFree: boolean;
}): number {
  if (isFirstAssistantTurn) {
    return 550;
  }

  return isFree ? 4000 : 10000;
}
