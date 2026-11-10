# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Behavioral guidelines live in `.claude/CLAUDE.md` (loaded automatically).

## Commands

Requires Node >= 22.18 (scripts run `.ts` files directly via Node's type stripping).

```bash
npm install
npm run dev                       # Vite dev server, http://localhost:5173
npm run build                     # tsc -b typecheck + vite build -> dist/
npm run preview                   # serve dist/
npm run test:rag                  # keyword (BM25) retrieval check
npm run test:rag -- --semantic    # hybrid check; downloads the embedding model
```

There is no linter or unit test framework. `test:rag` is the only test; it is a table of `[question, expected top chunk id]` cases in `scripts/rag-check.ts`. CI (`.github/workflows/ci.yml`) runs `test:rag` then `build` on every push; it does not deploy. The live site is deployed by Vercel from `master`, with `VITE_CHAT_API` set in Vercel's environment variables.

Imports use explicit `.ts`/`.tsx` extensions (`allowImportingTsExtensions`, `verbatimModuleSyntax` → use `import type` for types).

## Architecture

React 19 + TypeScript single-page portfolio with a resume chatbot that runs fully in the browser (no server, no API keys).

- `src/data/resume.ts` is the single source of truth: both the page sections (`src/components/*`) and the chatbot read from it. To update the resume, edit this file, replace `public/Deepanshu_Lakde_Resume.pdf`, and run `npm run test:rag`.
- `src/rag/knowledge.ts` turns resume data into `chunks` with stable ids (e.g. `exp-0`, `proj-1`, `ai-skills`) that `rag-check.ts` asserts against. Changing chunk ids/order requires updating the test cases.

Chat pipeline (`src/rag/assistant.ts` → `respond()`), driven by `src/components/ChatWidget.tsx`:

1. `smallTalk()` short-circuits greetings with canned replies.
2. Short follow-up questions are concatenated with the previous user question for retrieval.
3. `retrieve()` in `engine.ts` does hybrid ranking: BM25 with synonym expansion (fused 0.45) + cosine similarity from `embeddings.ts` (fused 0.55). Semantic scores are optional; if the embedding model (`Xenova/all-MiniLM-L6-v2` via `@huggingface/transformers`) isn't loaded within 4s, retrieval is keyword-only.
4. If `VITE_CHAT_API` is set, `llm.ts` sends the question, history and top chunk **ids** to the Cloudflare Worker in `worker/` (Workers AI, `@cf/meta/llama-3.1-8b-instruct-fp8`), which builds the prompt server-side from those chunks and streams plain text back. Otherwise, or on any API error, `extractive()` answers with the top hit.

The embedding model is a lazy-loaded singleton with retry-on-failure (`loadEmbeddings`). `vite.config.ts` excludes `@huggingface/transformers` from dep optimization to keep ONNX WASM loading working.

`worker/` is a separate package (own `package.json`, `wrangler.toml`): it imports `src/rag/knowledge.ts` so prompt context can only be resume chunks; it checks `ALLOWED_ORIGINS`, rate-limits per IP and validates input. Check with `cd worker && npx tsc --noEmit`; deploy with `npx wrangler deploy`.

`_archive/3d-version/` is the old vanilla-JS site, not part of the build.
