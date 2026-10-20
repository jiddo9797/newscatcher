// Google Gemini API 호출 (5단계 채점에 사용)
// SDK 없이 REST API를 직접 부른다. 키는 .env.local의 GEMINI_API_KEY에서 읽는다. (코드에 키를 넣지 않음)

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// "...-latest"는 Google이 최신 모델로 자동 연결해 주는 이름이다. (2026-10-21 무료 등급 호출 확인)
// - 기본: gemini-flash-latest (→ gemini-3.8-flash) 실제 채점 1회 약 70초, 더 꼼꼼함
// - 대체: gemini-flash-lite-latest (→ gemini-3.5-flash-lite) 약 45초, 기본 모델이 느리거나 붐빌 때 사용
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
export const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest";

/** retryable: 잠시 뒤 다시 하면 될 수도 있는 오류인지 (요청 과다, 서버 오류, 시간 초과) */
export class GeminiError extends Error {
  retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "GeminiError";
    this.retryable = retryable;
  }
}

/** 다시 시도할 만한 오류인지. (모듈이 다시 불러와지면 instanceof가 틀릴 수 있어 값으로 확인) */
export function isRetryable(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { retryable?: unknown }).retryable === true;
}

type GenerateOptions = {
  model?: string;
  system: string; // AI의 역할과 규칙
  prompt: string; // 이번에 처리할 내용
  schema: object; // 답변 JSON 모양 (JSON Schema)
  timeoutMs?: number;
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  modelVersion?: string;
  error?: { message?: string };
};

/** 정해진 JSON 모양으로 답을 받는다. */
export async function generateJson<T>({ model = GEMINI_MODEL, system, prompt, schema, timeoutMs = 120_000 }: GenerateOptions) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError(".env.local에 GEMINI_API_KEY가 없어요.", false);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // 낮을수록 같은 글에 비슷한 점수가 나온다
          responseMimeType: "application/json",
          responseJsonSchema: schema,
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new GeminiError(timedOut ? `AI 응답이 ${timeoutMs / 1000}초 안에 오지 않았어요.` : `AI 서버에 연결하지 못했어요.`, true);
  }

  const body = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500;
    const reason = response.status === 429 ? "무료 사용 한도를 넘었어요. 잠시 뒤 다시 시도해 주세요." : body.error?.message;
    throw new GeminiError(`AI 요청 실패 (HTTP ${response.status}): ${reason ?? "알 수 없는 오류"}`, retryable);
  }

  if (body.promptFeedback?.blockReason) {
    throw new GeminiError(`AI가 요청을 거절했어요: ${body.promptFeedback.blockReason}`, false);
  }
  const text = body.candidates?.[0]?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("");
  if (!text) throw new GeminiError("AI 답변이 비어 있어요.", true);

  try {
    return { data: JSON.parse(text) as T, modelVersion: body.modelVersion ?? model };
  } catch {
    throw new GeminiError("AI 답변이 올바른 JSON이 아니에요.", true);
  }
}
