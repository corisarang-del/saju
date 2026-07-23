type PaymentEnv = Partial<Record<string, string | undefined>>;

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function isEnabledValue(value: string | undefined): boolean {
  return TRUE_VALUES.has((value ?? "").trim().toLowerCase());
}

export function arePaymentsEnabled(env: PaymentEnv = process.env): boolean {
  return isEnabledValue(env.PAYMENTS_ENABLED);
}

export function areClientPaymentsEnabled(env: PaymentEnv = process.env): boolean {
  return isEnabledValue(env.NEXT_PUBLIC_PAYMENTS_ENABLED);
}

export function assertPaymentsEnabled(env: PaymentEnv = process.env): void {
  if (!areClientPaymentsEnabled(env)) {
    throw new Error("결제 기능은 현재 비활성화되어 있어.");
  }
}
