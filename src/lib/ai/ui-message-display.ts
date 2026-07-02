type UiMessagePartLike = Record<string, unknown>;

interface UiMessageDisplayInput {
  role: string;
  parts?: UiMessagePartLike[];
}

const EMPTY_ASSISTANT_FALLBACK = "분석 응답을 이어받지 못했어. 잠시 후 다시 시도해줘.";

function getStringField(value: unknown, field: string): string | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const fieldValue = (value as Record<string, unknown>)[field];
  return typeof fieldValue === "string" ? fieldValue : undefined;
}

function getPartText(part: UiMessagePartLike): string {
  if (part.type === "text") {
    return typeof part.text === "string" ? part.text : "";
  }

  if (part.type === "error" || part.type === "tool-input-error" || part.type === "tool-output-error") {
    return typeof part.errorText === "string"
      ? part.errorText
      : getStringField(part.error, "message") ?? "";
  }

  if (typeof part.type === "string" && part.type.startsWith("data-")) {
    return getStringField(part.data, "message") ?? getStringField(part.data, "errorText") ?? "";
  }

  return "";
}

export function getUiMessageDisplayText(message: UiMessageDisplayInput): string {
  const text = (message.parts ?? []).map(getPartText).join("").trimEnd();

  if (text) {
    return text;
  }

  return message.role === "assistant" ? EMPTY_ASSISTANT_FALLBACK : "";
}
