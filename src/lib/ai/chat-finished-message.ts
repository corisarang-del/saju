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
    .map((part) => {
      if (part.type === "text" && typeof part.text === "string") {
        return part.text;
      }

      if (
        (part.type === "error" || part.type === "tool-input-error" || part.type === "tool-output-error")
        && typeof part.errorText === "string"
      ) {
        return part.errorText;
      }

      if (typeof part.type === "string" && part.type.startsWith("data-")) {
        const data = part.data;
        if (typeof data === "object" && data !== null) {
          const message = (data as Record<string, unknown>).message;
          const errorText = (data as Record<string, unknown>).errorText;
          return typeof message === "string"
            ? message
            : typeof errorText === "string"
              ? errorText
              : "";
        }
      }

      return "";
    })
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
