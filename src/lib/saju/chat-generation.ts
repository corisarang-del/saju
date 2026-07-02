export function getChatMaxOutputTokens({ isFree }: { isFree: boolean }): number {
  return isFree ? 4000 : 10000;
}
