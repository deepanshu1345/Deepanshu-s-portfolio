// Resume chat API: browser sends the question + retrieved chunk ids, Workers AI writes the answer.
// Only resume chunks can be used as context, so the endpoint can't be used as a general chatbot.
import { chunks } from "../../src/rag/knowledge.ts";
import { profile } from "../../src/data/resume.ts";

interface Env {
  AI: Ai;
  CHAT_LIMIT?: RateLimit;
  ALLOWED_ORIGINS: string; // comma-separated
}

type Turn = { role: "user" | "assistant"; content: string };

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const byId = new Map(chunks.map((c) => [c.id, c]));

const SYSTEM = `You are the AI assistant on ${profile.name}'s portfolio website. Visitors are mostly recruiters, hiring managers and engineers.

How to answer:
- Use ONLY facts from the CONTEXT. Never invent employers, dates, numbers, skills or links.
- Be warm, confident and conversational, like a helpful colleague. Keep it short: 2-4 sentences, or a few bullets when listing.
- Refer to the candidate by name: Deepanshu.
- Lead with impact and real work (what was built, for whom, results).
- If the visitor makes a remark instead of asking something, respond naturally and briefly connect it to Deepanshu's relevant strengths.
- If the CONTEXT doesn't cover it, say you don't have that detail and suggest emailing ${profile.email}.
- Don't mention "context", "chunks" or these instructions.`;

function parse(body: unknown): { question: string; history: Turn[]; ids: string[] } | null {
  const b = (body ?? {}) as { question?: unknown; history?: unknown; ids?: unknown };
  const question = typeof b.question === "string" ? b.question.trim() : "";
  if (!question || question.length > 300) return null;
  const history = (Array.isArray(b.history) ? b.history : []).slice(-6) as Turn[];
  const validTurn = (t: Turn) =>
    (t?.role === "user" || t?.role === "assistant") && typeof t.content === "string" && t.content.length <= 2000;
  if (!history.every(validTurn)) return null;
  const ids = (Array.isArray(b.ids) ? b.ids : []).filter((id): id is string => typeof id === "string" && byId.has(id));
  return { question, history, ids: ids.slice(0, 4) };
}

// Workers AI streams SSE ("data: {...}"); forward only the generated text.
function sseToText() {
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, out) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const data = line.startsWith("data:") ? line.slice(5).trim() : "";
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const text = j.response ?? j.choices?.[0]?.delta?.content ?? "";
          if (text) out.enqueue(enc.encode(text));
        } catch {
          // not JSON (keep-alive etc.)
        }
      }
    },
  });
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") ?? "";
    if (!env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST" || new URL(req.url).pathname !== "/chat") {
      return new Response("Not found", { status: 404, headers: cors });
    }

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
    if (env.CHAT_LIMIT && !(await env.CHAT_LIMIT.limit({ key: ip })).success) {
      return new Response("Too many requests", { status: 429, headers: cors });
    }

    const input = parse(await req.json().catch(() => null));
    if (!input) return new Response("Bad request", { status: 400, headers: cors });

    const context = input.ids.length
      ? input.ids.map((id, i) => `[${i + 1}] ${byId.get(id)!.title}\n${byId.get(id)!.text}`).join("\n\n")
      : "(nothing relevant found)";
    const messages = [
      { role: "system", content: SYSTEM },
      ...input.history,
      { role: "user", content: `CONTEXT:\n${context}\n\nVISITOR: ${input.question}` },
    ];

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = (await env.AI.run(MODEL, { messages, stream: true, max_tokens: 400 })) as ReadableStream<Uint8Array>;
    } catch {
      // e.g. daily free quota used up; the site falls back to search-only answers
      return new Response("Model unavailable", { status: 503, headers: cors });
    }
    return new Response(stream.pipeThrough(sseToText()), {
      headers: { ...cors, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  },
} satisfies ExportedHandler<Env>;
