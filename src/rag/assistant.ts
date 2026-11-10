// The full RAG flow: hybrid retrieve → (LLM generate via Worker | extractive fallback).
import { extractive, retrieve, smallTalk, toSources, type Answer } from "./engine.ts";
import { semanticScores } from "./embeddings.ts";
import { streamAnswer, type Turn } from "./llm.ts";

export type { Turn };

// Follow-ups like "what stack did it use?" need the previous question for retrieval.
const retrievalQuery = (q: string, history: Turn[]) => {
  const prev = [...history].reverse().find((t) => t.role === "user")?.content;
  return prev && q.split(/\s+/).length < 7 ? `${prev} ${q}` : q;
};

export async function respond(
  question: string,
  history: Turn[],
  opts: { llm: boolean; onToken?: (text: string) => void },
): Promise<Answer & { generated: boolean }> {
  const quick = smallTalk(question);
  if (quick) return { text: quick, sources: [], generated: false };

  const rq = retrievalQuery(question, history);
  const { hits } = retrieve(rq, 4, await semanticScores(rq));
  const fallback = () => ({ ...extractive(hits.slice(0, 3)), generated: false });

  if (!opts.llm) return fallback();

  // The Worker builds the prompt from these chunk ids; only resume text can be context.
  let text = "";
  try {
    for await (const tok of streamAnswer(question, history.slice(-6), hits.map((h) => h.chunk.id))) {
      text += tok;
      opts.onToken?.(text);
    }
  } catch {
    if (!text) return fallback(); // API down / rate-limited / quota used up
  }
  return { text: text.trim(), sources: toSources(hits.slice(0, 3)), generated: true };
}
