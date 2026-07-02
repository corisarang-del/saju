type ChatMessageLike = {
  role?: string;
  content?: unknown;
  parts?: Array<Record<string, unknown>>;
};

interface FinishedAssistantInput {
  message: ChatMessageLike;
  messages: ChatMessageLike[];
}

export function getChatMessagePlainText(message: ChatMessageLike): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  return (message.parts ?? [])
    .filter((part): part is { type: "text"; text: string } =>
      part.type === "text" && typeof part.text === "string",
    )
    .map((part) => part.text)
    .join("");
}

export function getFinishedAssistantText({ message, messages }: FinishedAssistantInput): string {
  const primaryText = getChatMessagePlainText(message).trim();
  if (primaryText) {
    return primaryText;
  }

  const latestAssistant = [...messages].reverse().find((item) => item.role === "assistant");
  return latestAssistant ? getChatMessagePlainText(latestAssistant).trim() : "";
}
