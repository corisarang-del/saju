interface SerializedChatProviderError {
  name: string;
  message: string;
  statusCode?: number;
  causeName?: string;
  causeMessage?: string;
  isQuotaOrRateLimit: boolean;
}

function getErrorField(error: unknown, field: "name" | "message"): string | undefined {
  if (error instanceof Error) {
    return typeof error[field] === "string" ? error[field] : undefined;
  }

  if (typeof error === "object" && error !== null && field in error) {
    const value = (error as Record<string, unknown>)[field];
    return typeof value === "string" ? value : undefined;
  }

  if (field === "message" && typeof error === "string") {
    return error;
  }

  return undefined;
}

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const status = record.status ?? record.statusCode;
  return typeof status === "number" ? status : undefined;
}

function getCause(error: unknown): unknown {
  if (error instanceof Error) {
    return error.cause;
  }

  if (typeof error === "object" && error !== null && "cause" in error) {
    return (error as Record<string, unknown>).cause;
  }

  return undefined;
}

function isQuotaOrRateLimitError(error: unknown): boolean {
  const statusCode = getStatusCode(error);
  if (statusCode === 429) {
    return true;
  }

  const cause = getCause(error);
  const text = [
    getErrorField(error, "name"),
    getErrorField(error, "message"),
    getErrorField(cause, "name"),
    getErrorField(cause, "message"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("quota")
    || text.includes("rate limit")
    || text.includes("resource_exhausted")
    || text.includes("too many requests");
}

function getExistingUserFacingMessage(error: unknown): string | undefined {
  const message = getErrorField(error, "message");
  if (
    message === "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘."
    || message === "분석 응답을 만들지 못했어. 잠시 후 다시 시도해줘."
    || message === "분석 응답이 중간에 끊겼어. 별은 차감하지 않았으니 다시 분석해줘."
    || message === "분석 응답이 너무 짧게 끝났어. 별은 차감하지 않았으니 다시 분석해줘."
    || message === "응답을 받지 못했어. 별은 차감하지 않았으니 다시 시도해줘."
  ) {
    return message;
  }

  return undefined;
}

export function getUserFacingChatErrorMessage(error: unknown): string {
  const existingMessage = getExistingUserFacingMessage(error);
  if (existingMessage) {
    return existingMessage;
  }

  if (isQuotaOrRateLimitError(error)) {
    return "지금 AI 응답 한도가 잠시 막혔어. 잠시 후 다시 시도해줘.";
  }

  return "분석 응답을 만들지 못했어. 잠시 후 다시 시도해줘.";
}

export function serializeChatProviderError(error: unknown): SerializedChatProviderError {
  const cause = getCause(error);

  return {
    name: getErrorField(error, "name") ?? typeof error,
    message: getErrorField(error, "message") ?? String(error),
    statusCode: getStatusCode(error),
    causeName: getErrorField(cause, "name"),
    causeMessage: getErrorField(cause, "message"),
    isQuotaOrRateLimit: isQuotaOrRateLimitError(error),
  };
}
