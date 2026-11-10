// LLM answers come from the Cloudflare Worker in /worker (Workers AI). Set VITE_CHAT_API to its URL.
const API = import.meta.env.VITE_CHAT_API as string | undefined;

export const LLM_LABEL = "Llama 3.1 8B";

// "ready" when an API is configured; otherwise the bot answers from retrieved passages only.
export type LlmStatus = "ready" | "unsupported";
const state = { status: (API ? "ready" : "unsupported") as LlmStatus };
export const useLlm = () => state;

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

/** Streams the answer text. Throws if the API is missing, rate-limited or down. */
export async function* streamAnswer(question: string, history: Turn[], ids: string[]) {
  if (!API) throw new Error("No chat API configured");
  const res = await fetch(`${API.replace(/\/$/, "")}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history, ids }),
  });
  if (!res.ok || !res.body) throw new Error(`Chat API ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}
