export const FIRST_CONSULTATION_LOADING_STEPS = [
  { afterMs: 0, message: "사주 흐름을 정리하고 있어" },
  { afterMs: 10_000, message: "고민에 맞는 상담 방향을 잡고 있어" },
  { afterMs: 30_000, message: "답변이 조금 길어지고 있어. 완료되면 바로 보여줄게" },
] as const;

export function getFirstConsultationLoadingMessage(elapsedMs: number): string {
  return [...FIRST_CONSULTATION_LOADING_STEPS]
    .reverse()
    .find((step) => elapsedMs >= step.afterMs)?.message
    ?? FIRST_CONSULTATION_LOADING_STEPS[0].message;
}
