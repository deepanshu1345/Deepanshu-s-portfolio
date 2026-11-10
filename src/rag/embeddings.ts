// Semantic search with a small sentence-embedding model (~23 MB, runs on CPU/WASM).
import { chunks } from "./knowledge.ts";

export const EMBED_MODEL = "Xenova/all-MiniLM-L6-v2"; // q8 = onnx/model_quantized.onnx

type Embed = (texts: string[]) => Promise<number[][]>;
let ready: Promise<{ embed: Embed; chunkVecs: number[][] }> | null = null;

const plain = (md: string) => md.replace(/\*\*/g, "").replace(/^- /gm, "");

/** Loads the model once and embeds all chunks. Safe to call repeatedly. */
export function loadEmbeddings() {
  ready ??= (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    const extractor = await pipeline("feature-extraction", EMBED_MODEL, { dtype: "q8" });
    const embed: Embed = async (texts) =>
      (await extractor(texts, { pooling: "mean", normalize: true })).tolist() as number[][];
    const chunkVecs = await embed(chunks.map((c) => `${c.title}. ${plain(c.text)}`));
    return { embed, chunkVecs };
  })();
  ready.catch(() => (ready = null)); // allow retry
  return ready;
}

const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

/** Cosine similarity of the query to every chunk, or null if the model isn't available. */
export async function semanticScores(query: string, waitMs = 4000): Promise<number[] | null> {
  try {
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), waitMs));
    const model = await Promise.race([loadEmbeddings(), timeout]);
    if (!model) return null;
    // Every chunk is about Deepanshu, so the name only adds noise.
    const [q] = await model.embed([query.replace(/\bdeepanshu('s)?( lakde)?\b/gi, "").trim() || query]);
    return model.chunkVecs.map((v) => dot(q, v)); // vectors are normalized
  } catch {
    return null;
  }
}
