type SafeJsonOptions = {
  requestId?: string;
  source?: string;
};

type SafeJsonSuccess<T> = {
  ok: true;
  data: T;
};

type SafeJsonFailure = {
  ok: false;
  response: Response;
};

export type SafeJsonResult<T> = SafeJsonSuccess<T> | SafeJsonFailure;

export async function safeJson<T = unknown>(
  req: Request,
  options: SafeJsonOptions = {},
): Promise<SafeJsonResult<T>> {
  try {
    return {
      ok: true,
      data: (await req.json()) as T,
    };
  } catch (error) {
    if (options.source) {
      console.warn(`[${options.source}] invalid JSON body`, {
        requestId: options.requestId,
        error: error instanceof Error ? error.name : "unknown",
      });
    }

    return {
      ok: false,
      response: Response.json(
        {
          error: "invalid_json",
          message: "요청 본문은 올바른 JSON이어야 해.",
          ...(options.requestId ? { requestId: options.requestId } : {}),
        },
        { status: 400 },
      ),
    };
  }
}
