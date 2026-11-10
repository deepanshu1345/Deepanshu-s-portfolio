// Hero console: runs the real RAG pipeline on a question and shows every stage.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import { SUGGESTIONS, expand, extractive, retrieve, smallTalk, tokenize, type Answer, type Hit } from "../rag/engine.ts";
import { chunks } from "../rag/knowledge.ts";
import { EMBED_MODEL, loadEmbeddings, semanticScores } from "../rag/embeddings.ts";
import { LLM_LABEL, useLlm } from "../rag/llm.ts";
import { respond } from "../rag/assistant.ts";
import { Markdown } from "./ChatWidget.tsx";
import type { OpenChat } from "../App.tsx";

interface Trace {
  q: string;
  tokens: string[];
  terms: [string, number][];
  all: Hit[];
  top: string[]; // chunk ids, ranked
  answer: Answer;
  llm: boolean; // answer streams from the Workers AI LLM
  ms: { tok: number; emb: number | null; rank: number };
}

type Emb = "cold" | "loading" | "warm" | "error";
const STAGES = ["tokenize", "expand", "embed", "rank", "answer"] as const;
const STEP_MS = 320;
const now = () => performance.now();
// Browsers coarsen timers to ~0.1ms.
const fmt = (ms: number) => (ms < 0.1 ? "<0.1ms" : ms < 1 ? `${(ms * 1000).toFixed(0)}µs` : `${ms.toFixed(1)}ms`);
const EMPTY: Hit[] = chunks.map((chunk) => ({ chunk, score: 0, kw: 0, sem: null }));

export default function GlassBox({ openChat }: { openChat: OpenChat }) {
  const [input, setInput] = useState("");
  const [trace, setTrace] = useState<Trace | null>(null);
  const [phase, setPhase] = useState(0); // stages revealed
  const [shown, setShown] = useState(0); // extractive chars revealed
  const [gen, setGen] = useState(""); // streamed LLM text
  const [hybrid, setHybrid] = useState(true);
  const [emb, setEmb] = useState<Emb>("cold");
  const [auto, setAuto] = useState(true);
  const { status: llm } = useLlm();
  const runId = useRef(0);

  const warm = () => {
    if (emb !== "cold" && emb !== "error") return;
    setEmb("loading");
    loadEmbeddings().then(() => setEmb("warm"), () => setEmb("error"));
  };

  const run = async (q: string, live = true) => {
    const id = ++runId.current;
    const useSem = live && hybrid && emb === "warm";
    let t = now();
    const tokens = tokenize(q);
    const tok = now() - t;

    let sem: number[] | null = null;
    let embMs: number | null = null;
    if (useSem) {
      t = now();
      sem = await semanticScores(q);
      embMs = now() - t;
    }
    if (id !== runId.current) return; // a newer run started

    t = now();
    const { hits, all } = retrieve(q, 3, sem);
    const rank = now() - t;
    const quick = smallTalk(q);
    const useLLM = live && !quick && llm === "ready"; // autoplay never calls the API

    setTrace({
      q, tokens, all, llm: useLLM,
      terms: [...expand(q)],
      top: hits.map((h) => h.chunk.id),
      answer: quick ? { text: quick, sources: [] } : extractive(hits),
      ms: { tok, emb: sem ? embMs : null, rank },
    });
    setPhase(0);
    setShown(0);
    setGen("");

    if (useLLM) {
      const a = await respond(q, [], { llm: true, onToken: (s) => id === runId.current && setGen(s) }).catch(() => null);
      if (id !== runId.current) return;
      if (a) setTrace((tr) => tr && { ...tr, answer: { ...tr.answer, sources: a.sources } });
      else setTrace((tr) => tr && { ...tr, llm: false }); // fall back to extractive
    }
  };

  // Reveal stages one by one, then type the extractive answer.
  useEffect(() => {
    if (!trace) return;
    if (phase < STAGES.length) {
      const t = setTimeout(() => setPhase((p) => p + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    if (!trace.llm && shown < trace.answer.text.length) {
      const t = setTimeout(() => setShown((s) => s + 6), 14);
      return () => clearTimeout(t);
    }
  }, [trace, phase, shown]);

  // Tell the hero's embedding-space visual which chunks were retrieved.
  useEffect(() => {
    if (trace && phase === STAGES.indexOf("rank") + 1) window.dispatchEvent(new CustomEvent("rag:hits", { detail: trace.top }));
  }, [trace, phase]);

  // Autoplay: type each suggestion until the visitor takes over.
  useEffect(() => {
    if (!auto) return;
    let i = 0, n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const q = SUGGESTIONS[i % SUGGESTIONS.length];
      if (n < q.length) {
        setInput(q.slice(0, ++n));
        timer = setTimeout(tick, 34);
      } else {
        run(q, false);
        i++;
        n = 0;
        timer = setTimeout(tick, 6200);
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  // Re-run when embeddings finish loading or the mode flips, so the bars visibly shift.
  useEffect(() => {
    if (!auto && trace) run(trace.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emb, hybrid]);

  const takeOver = () => {
    if (auto) (setAuto(false), setInput(""));
    warm();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    takeOver();
    run(q);
  };

  const ask = (q: string) => (takeOver(), setInput(q), run(q));
  const on = (stage: (typeof STAGES)[number]) => !!trace && phase > STAGES.indexOf(stage);
  const semOn = trace?.ms.emb != null;
  const total = trace ? trace.ms.tok + (trace.ms.emb ?? 0) + trace.ms.rank : 0;
  const text = trace ? (trace.llm ? gen : trace.answer.text.slice(0, shown)) : "";

  return (
    <div className="gb" data-reveal>
      <div className="gb__bar mono">
        <span className="gb__live"><span className="pulse" /> LIVE</span>
        <span className="hide-sm">resume-rag</span>
        <span>{chunks.length} chunks</span>
        <span>embedder <b className={`gb__emb gb__emb--${emb}`}>{emb}</b></span>
        <span className="hide-sm">retrieval <b>{trace ? fmt(total) : "—"}</b></span>
        <button
          className={`gb__mode ${hybrid ? "on" : ""}`}
          onClick={() => (setHybrid((h) => !h), takeOver())}
          title="Switch semantic search off to see what keyword search alone retrieves"
          aria-pressed={hybrid}
        >
          {hybrid ? "hybrid" : "keyword only"} <i />
        </button>
      </div>

      <form className="gb__query" onSubmit={submit}>
        <span className="mono gb__prompt">query&gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={takeOver}
          placeholder="Ask anything about Deepanshu…"
          aria-label="Ask the resume pipeline"
          maxLength={200}
        />
        {auto && <span className="caret" />}
        <button className="btn btn--primary btn--sm" disabled={!input.trim() || auto}>
          Run <CornerDownLeft size={14} />
        </button>
      </form>

      <div className="gb__grid">
        <ol className="gb__stages">
          <li className={on("tokenize") ? "on" : ""}>
            <header><span>01</span> tokenize <em>{trace && fmt(trace.ms.tok)}</em></header>
            <div className="gb__chips">
              {trace && (trace.tokens.length ? trace.tokens.map((t, i) => <code key={i}>{t}</code>) : <small>stopwords only</small>)}
            </div>
          </li>
          <li className={on("expand") ? "on" : ""}>
            <header><span>02</span> expand synonyms</header>
            <div className="gb__chips">
              {trace && (trace.terms.some(([, w]) => w < 1)
                ? trace.terms.filter(([, w]) => w < 1).map(([t]) => <code key={t} className="syn">+{t}</code>)
                : <small>no expansion needed</small>)}
            </div>
          </li>
          <li className={on("embed") ? "on" : ""}>
            <header><span>03</span> embed query <em>{semOn && fmt(trace!.ms.emb!)}</em></header>
            <small>
              {semOn ? `${EMBED_MODEL.split("/")[1]} · 384-d · cosine × ${chunks.length}`
                : !hybrid ? "skipped · keyword-only mode"
                : emb === "loading" ? "loading 23 MB model in your browser…"
                : emb === "error" ? "model unavailable · keyword fallback"
                : "standby · type a question to load"}
            </small>
          </li>
          <li className={on("rank") ? "on" : ""}>
            <header><span>04</span> {semOn ? "bm25 ⊕ cosine" : "bm25"} <em>{trace && fmt(trace.ms.rank)}</em></header>
            <small>{semOn ? "0.45 keyword + 0.55 semantic → top 3" : "keyword score → top 3"}</small>
          </li>
          <li className={on("answer") ? "on" : ""}>
            <header><span>05</span> grounded answer</header>
            <small>{trace?.llm ? `${LLM_LABEL} · Cloudflare Workers AI` : "retrieved passages only · no server"}</small>
          </li>
        </ol>

        {/* Fixed rows so bars visibly move between runs */}
        <div className="gb__map">
          <div className="gb__legend mono">
            <span>chunk</span>
            <span><i className="k" /> bm25</span>
            <span><i className="s" /> cosine</span>
            <span>score</span>
          </div>
          {(trace?.all ?? EMPTY).map((h) => {
            const lit = on("rank");
            const rank = lit ? trace!.top.indexOf(h.chunk.id) : -1;
            return (
              <div key={h.chunk.id} className={`gb__row ${rank >= 0 ? "hit" : ""}`}>
                <span className="gb__title">
                  {rank >= 0 && <b>#{rank + 1}</b>}
                  {h.chunk.title}
                </span>
                <span className="gb__meter k"><span style={{ width: `${lit ? h.kw * 100 : 0}%` }} /></span>
                <span className="gb__meter s"><span style={{ width: `${lit && h.sem !== null ? Math.max(0, h.sem) * 100 : 0}%` }} /></span>
                <span className="mono gb__score">{lit ? h.score.toFixed(2) : "·"}</span>
              </div>
            );
          })}
        </div>

        <div className={`gb__answer ${on("answer") ? "on" : ""}`}>
          <header className="mono">
            <span>answer · {trace?.llm ? "generated" : "extractive"}</span>
            {on("answer") && trace!.answer.sources.map((s, i) => <span key={s.title} className="gb__cite">[{i + 1}] {s.title}</span>)}
          </header>
          <div className="gb__text">
            {on("answer") && text ? <Markdown text={text} /> : <span className="muted mono">{trace?.llm && on("answer") ? "generating…" : "waiting for retrieval…"}</span>}
          </div>
          <footer>
            <button className="btn btn--ghost btn--sm" onClick={() => openChat(trace?.q)}>
              Continue in chat <ArrowRight size={14} />
            </button>
          </footer>
        </div>
      </div>

      <div className="gb__try">
        {SUGGESTIONS.slice(0, 4).map((s) => (
          <button key={s} onClick={() => ask(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}
