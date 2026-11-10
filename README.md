# Deepanshu Lakde — AI Engineer Portfolio

Modern portfolio built with **React + TypeScript + Vite**, featuring a **RAG chatbot that answers questions about my resume**. It runs entirely in the browser: no paid APIs, no server, no keys.

## How the chatbot works

1. **Knowledge**: `src/data/resume.ts` (single source of truth for site + bot) is split into chunks by `src/rag/knowledge.ts`.
2. **Hybrid retrieval**: BM25 keyword search (`engine.ts`) fused with semantic search using `all-MiniLM-L6-v2` embeddings via Transformers.js (`embeddings.ts`, ~23 MB, runs on any device).
3. **Generation**: the browser sends the question + retrieved chunk ids to a Cloudflare Worker (`worker/`), which builds the prompt from those resume chunks and streams an answer from Llama 3.1 8B on Workers AI (free tier).
4. **Fallback**: if the Worker isn't configured, is rate-limited or is out of free quota, the bot answers with the best-matching resume passage.

## Deploy the chat API (Cloudflare Workers AI, free)

```bash
cd worker
npm install
npx wrangler login        # opens the browser once
npx wrangler deploy       # prints https://resume-chat.<you>.workers.dev
```

Then in GitHub → Settings → Secrets and variables → Actions → **Variables**, add `CHAT_API_URL` = that URL and re-run the Pages workflow. For local dev, put `VITE_CHAT_API=<url>` in `.env.local`. Allowed site origins are set in `worker/wrangler.toml` (`ALLOWED_ORIGINS`).

Sources and relevance scores are shown under each answer.

## Update the resume

1. Edit `src/data/resume.ts`.
2. Replace `public/Deepanshu_Lakde_Resume.pdf`.
3. Run `npm run test:rag` to check retrieval still finds the right chunks.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run test:rag   # retrieval check (add -- --semantic for hybrid)
```

Pushing to `master` builds and deploys to GitHub Pages via `.github/workflows/static.yml`.

## License

MIT © [Deepanshu Lakde](https://github.com/deepanshu1345)
