// Retrieval: BM25 keyword search, optionally fused with semantic (embedding) scores.
// Also provides the no-LLM fallback answer built from retrieved passages.
import { chunks, type Chunk } from "./knowledge.ts";

const STOP = new Set(
  "a an the is are was were be been am do does did have has had i you he him his her she they them their me my your what which who whom when where why how can could would should will shall may might of in on at to for from by with about as into than then so and or but if not no yes this that these those it its there here please tell give show list any some all much many more most also just whats hes deepanshu lakde done doing make made get got use used using like want good best well really very kind thing things someone person guy describe explain share detail details info information something anything ever currently now experienced worked dont don we us our through walk".split(
    " ",
  ),
);

// Query expansion: maps user wording onto resume vocabulary.
const SYNONYMS: Record<string, string[]> = {
  job: ["experience"], work: ["experience"], company: ["experience"], career: ["experience"], employ: ["experience"],
  college: ["education"], university: ["education"], degree: ["education"], study: ["education"], qualification: ["education"],
  tech: ["skills"], stack: ["skills"], technology: ["skills"], tool: ["skills"], language: ["skills"], know: ["skills"], framework: ["skills"],
  ai: ["llm", "rag"], ml: ["ai"], genai: ["llm"], gpt: ["llm"], chatgpt: ["llm"], openai: ["llm"],
  db: ["database"], database: ["postgresql", "mongodb", "mysql", "mariadb"], sql: ["postgresql", "mysql"],
  backend: ["django", "api"], api: ["rest"], email: ["contact"], mail: ["contact"], phone: ["contact"], cv: ["resume"],
  hire: ["fit", "contact"], strength: ["fit"], achievement: ["impact"], latest: ["recent"], recent: ["latest"],
};

const stem = (w: string) =>
  w.length > 4 && w.endsWith("ies") ? w.slice(0, -3) + "y"
  : w.length > 5 && w.endsWith("ing") ? w.slice(0, -3)
  : w.length > 4 && w.endsWith("ed") ? w.slice(0, -2)
  : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1)
  : w;

export const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/c\+\+/g, "cpp")
    .replace(/[’']s\b/g, "")
    .replace(/[’']t\b/g, "t")
    .split(/[^a-z0-9.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t && !STOP.has(t))
    .map(stem);

// ---------- BM25 index ----------
const K1 = 1.4;
const B = 0.75;
// Title repeated to boost it.
const docs = chunks.map((c) => tokenize(`${c.title} ${c.title} ${c.title} ${c.text} ${c.keywords ?? ""}`));
const avgLen = docs.reduce((n, d) => n + d.length, 0) / docs.length;
const df = new Map<string, number>();
docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
const idf = (t: string) => {
  const n = df.get(t) ?? 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
};
const tf = docs.map((d) => d.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>()));

/** Query terms with weights: 1 = typed, 0.6 = synonym expansion. */
export function expand(query: string): Map<string, number> {
  const base = tokenize(query);
  const weights = new Map<string, number>();
  base.forEach((t) => weights.set(t, 1));
  base.forEach((t) => (SYNONYMS[t] ?? []).forEach((s) => weights.set(stem(s), Math.max(weights.get(stem(s)) ?? 0, 0.6))));
  return weights;
}

function bm25(query: string): number[] {
  const weights = expand(query);
  return docs.map((d, i) => {
    let score = 0;
    weights.forEach((w, t) => {
      const f = tf[i].get(t) ?? 0;
      if (f) score += w * idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / avgLen)));
    });
    // Exact title mention (e.g. a project name) wins.
    if (score && query.toLowerCase().includes(chunks[i].title.toLowerCase())) score *= 2.2;
    return score;
  });
}

export interface Hit {
  chunk: Chunk;
  score: number; // fused score in [0, 1]
  kw: number; // normalized BM25 in [0, 1]
  sem: number | null; // raw cosine, null without embeddings
}

const SEM_MIN = 0.25; // cosine below this = unrelated

/** Hybrid retrieval. `semantic` = cosine similarity per chunk (same order as `chunks`). `all` = every chunk's scores, unfiltered. */
export function retrieve(query: string, k = 3, semantic?: number[] | null): { hits: Hit[]; all: Hit[] } {
  const kw = bm25(query);
  const kwMax = Math.max(...kw) || 1;
  const all = chunks.map((chunk, i) => {
    const k1 = kw[i] / kwMax;
    if (!semantic) return { chunk, score: k1, kw: k1, sem: null };
    const s = Math.max(0, (semantic[i] - SEM_MIN) / (1 - SEM_MIN));
    return { chunk, score: 0.45 * k1 + 0.55 * s, kw: k1, sem: semantic[i] };
  });
  const hits = all
    // With embeddings: drop keyword-only matches that are off-topic in meaning,
    // but always keep the best keyword match (the embedder misses acronyms like "RAG").
    .filter((_, i) => (semantic ? (kw[i] > 0 && (semantic[i] >= 0.15 || kw[i] === kwMax)) || semantic[i] >= SEM_MIN + 0.1 : kw[i] > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  return { hits, all };
}

// ---------- Answers ----------
export interface Answer {
  text: string;
  sources: { title: string; relevance: number }[];
}

export const toSources = (hits: Hit[]): Answer["sources"] => {
  const max = hits[0]?.score || 1;
  return hits.map((h) => ({ title: h.chunk.title, relevance: Math.round((h.score / max) * 100) }));
};

const SMALL_TALK: [RegExp, string][] = [
  [/^\s*(hi+|hello|hey|yo|hola|namaste|good (morning|afternoon|evening))\b[\s!.]*$/i,
    "Hey there! 👋 Happy to tell you about Deepanshu's work. What would you like to know?"],
  [/^\s*(thanks|thank you|thx|ty|cool|great|awesome|nice|ok|okay)\b[\s!.]*$/i,
    "Anytime! Feel free to ask anything else."],
  [/\b(who|what) are you\b|\bhow do you work\b|\bare you (an? )?(ai|bot|llm|gpt)\b/i,
    "I'm a RAG assistant Deepanshu built for this site. I search the resume using both keywords and meaning, then answer from what I find. Then Llama 3.1 8B on Cloudflare Workers AI writes the reply from those passages only."],
];

export const smallTalk = (q: string) => SMALL_TALK.find(([re]) => re.test(q))?.[1];

/** Fallback answer (no LLM): the single best-matching passage, verbatim. */
export function extractive(hits: Hit[]): Answer {
  if (!hits.length) {
    return {
      text: "Hmm, I don't have anything on that. I know Deepanshu's experience, projects, AI work and skills pretty well, though. Want to ask about one of those?",
      sources: [],
    };
  }
  return { text: hits[0].chunk.text, sources: toSources(hits) };
}

export const SUGGESTIONS = [
  "What AI work has Deepanshu done?",
  "Walk me through the experience",
  "What is the Agentic SQL Gateway?",
  "Why hire Deepanshu?",
  "What's the tech stack?",
  "How can I get in touch?",
];
