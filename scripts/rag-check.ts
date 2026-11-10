// Retrieval check: `npm run test:rag` (keyword only) or `npm run test:rag -- --semantic` (hybrid).
import { retrieve } from "../src/rag/engine.ts";

const semantic = process.argv.includes("--semantic");
const emb = semantic ? await import("../src/rag/embeddings.ts") : null;
if (emb) await emb.loadEmbeddings(); // throws if the model can't load
const scores = emb?.semanticScores;

const cases: [string, string][] = [
  ["What AI work has Deepanshu done?", "ai-skills"],
  ["Walk me through the experience", "experience-overview"],
  ["What is the Agentic SQL Gateway?", "proj-0"],
  ["Why hire Deepanshu?", "why-hire"],
  ["What's the tech stack?", "skills"],
  ["How can I get in touch?", "contact"],
  ["Where did he study?", "education"],
  ["Tell me about the ERPNext resume screening plugin", "proj-1"],
  ["What is Alfakinetic?", "proj-2"],
  ["Where was the internship?", "exp-1"],
  ["What was the latest job?", "exp-0"],
  ["Any RAG experience?", "ai-skills"],
  // Paraphrases that need semantic search:
  ...(semantic
    ? ([
        ["Has he worked with healthcare data?", "exp-0"],
        ["Can he turn plain English questions into database queries?", "proj-0"],
        ["Has he automated hiring for recruiters?", "proj-1"],
        ["Is he looking for a new role?", "contact"],
      ] as [string, string][])
    : []),
];

let fail = 0;
for (const [q, want] of cases) {
  const top = retrieve(q, 3, scores ? await scores(q, 120000) : null).hits.map((h) => h.chunk.id);
  const ok = top[0] === want;
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${q.padEnd(46)} → ${top.join(", ")}`);
}
console.log(fail ? `\n${fail} failed` : "\nAll passed");
process.exit(fail ? 1 : 0);
