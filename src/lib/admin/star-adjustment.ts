export type StarAdjustmentMode = "credit" | "debit";

export function parseStarAmount(rawAmount: FormDataEntryValue | string | null): number {
  const value = String(rawAmount ?? "").trim();

  if (!/^\d+$/.test(value)) {
    throw new Error("정수로 입력해줘");
  }

  const amount = Number(value);
  if (!Number.isSafeInteger(amount)) {
    throw new Error("너무 큰 숫자야");
  }

  if (amount < 1) {
    throw new Error("1개 이상 입력해줘");
  }

  return amount;
}

export function parseStarAdjustmentMode(rawMode: FormDataEntryValue | string | null): StarAdjustmentMode {
  if (rawMode === "credit" || rawMode === "debit") {
    return rawMode;
  }

  throw new Error("충전 또는 차감 중 하나를 선택해줘");
}

export function calculateStarBalance({
  currentBalance,
  amount,
  mode,
}: {
  currentBalance: number;
  amount: number;
  mode: StarAdjustmentMode;
}): number {
  if (mode === "credit") {
    return currentBalance + amount;
  }

  if (amount > currentBalance) {
    throw new Error("잔액보다 많이 차감할 수 없어");
  }

  return currentBalance - amount;
}

export function toTransactionAmount({
  mode,
  amount,
}: {
  mode: StarAdjustmentMode;
  amount: number;
}): number {
  return mode === "credit" ? amount : -amount;
}

export function getAdjustmentLabel(mode: StarAdjustmentMode): string {
  return mode === "credit" ? "충전" : "차감";
}
