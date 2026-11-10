import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Bot, FileSearch, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { SUGGESTIONS, type Answer } from "../rag/engine.ts";
import { respond, type Turn } from "../rag/assistant.ts";
import { loadEmbeddings } from "../rag/embeddings.ts";
import { LLM_LABEL, useLlm } from "../rag/llm.ts";

interface Msg {
  id: number;
  role: "user" | "bot";
  text: string;
  shown: number; // chars revealed (typewriter for non-streamed replies)
  sources?: Answer["sources"];
  generated?: boolean;
}

const WELCOME: Msg = {
  id: 0,
  role: "bot",
  text: "Hi! I'm Deepanshu's AI assistant. I search the resume and answer from it. Ask about projects, AI work, experience or anything else 👇",
  shown: Infinity,
};

// Tiny safe markdown: **bold**, "- " bullets, links.
function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) =>
    /^\*\*.+\*\*$/.test(part) ? <strong key={i}>{part.slice(2, -2)}</strong>
    : /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noreferrer">{part.replace(/^https?:\/\/(www\.)?/, "")}</a>
    : /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part) ? <a key={i} href={`mailto:${part}`}>{part}</a>
    : part,
  );
}
export function Markdown({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = () => list.length && (out.push(<ul key={out.length}>{list}</ul>), (list = []));
  text.split("\n").forEach((line, i) => {
    const m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
    if (m) list.push(<li key={i}>{inline(m[1])}</li>);
    else {
      flush();
      if (line.trim()) out.push(<p key={`p${i}`}>{inline(line)}</p>);
    }
  });
  flush();
  return <>{out}</>;
}

export default function ChatWidget(props: { open: boolean; question?: string; nonce: number; onOpen: () => void; onClose: () => void }) {
  const { open, question, nonce, onOpen, onClose } = props;
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { status: llm } = useLlm();
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // First open: warm up embeddings.
  useEffect(() => {
    if (open) loadEmbeddings().catch(() => {});
  }, [open]);

  const ask = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    const history: Turn[] = msgs
      .filter((m) => m.id !== 0)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    setMsgs((m) => [...m, { id: idRef.current++, role: "user", text: q, shown: Infinity }]);

    const botId = idRef.current++;
    const useLLM = llm === "ready";
    try {
      let started = false;
      const a = await respond(q, history, {
        llm: useLLM,
        onToken: (text) => {
          if (!started) {
            started = true;
            setMsgs((m) => [...m, { id: botId, role: "bot", text, shown: Infinity, generated: true }]);
          } else setMsgs((m) => m.map((x) => (x.id === botId ? { ...x, text } : x)));
        },
      });
      setMsgs((m) => {
        const done = { id: botId, role: "bot" as const, text: a.text, sources: a.sources, generated: a.generated, shown: a.generated ? Infinity : 0 };
        return m.some((x) => x.id === botId) ? m.map((x) => (x.id === botId ? done : x)) : [...m, done];
      });
    } catch {
      setMsgs((m) => [...m.filter((x) => x.id !== botId), { id: botId, role: "bot", text: "Sorry, something went wrong on my side. Please try again.", shown: Infinity }]);
    } finally {
      setBusy(false);
    }
  };

  // Typewriter for non-streamed replies.
  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (last.role !== "bot" || last.shown >= last.text.length) return;
    const t = setTimeout(() => setMsgs((m) => m.map((x) => (x.id === last.id ? { ...x, shown: x.shown + 4 } : x))), 12);
    return () => clearTimeout(t);
  }, [msgs]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, busy]);

  useEffect(() => {
    if (!open) return;
    if (question) ask(question);
    setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nonce]);

  const submit = (e: FormEvent) => (e.preventDefault(), ask(input));
  const last = msgs[msgs.length - 1];
  const thinking = busy && last.role === "user";

  return (
    <>
      <button className={`chat-fab ${open ? "chat-fab--hidden" : ""}`} onClick={onOpen} aria-label="Open resume chatbot">
        <Sparkles size={20} />
        <span>Ask my AI</span>
      </button>

      <aside className={`chat ${open ? "chat--open" : ""}`} aria-label="Resume chatbot" aria-hidden={!open}>
        <header className="chat__head">
          <span className="chat__avatar"><Bot size={18} /></span>
          <div>
            <strong>Resume RAG</strong>
            <span className="chat__status">
              <span className="pulse" />
              {llm === "ready" ? `${LLM_LABEL} · Workers AI` : "Hybrid search · in-browser"}
            </span>
          </div>
          <button className="icon-btn" onClick={() => setMsgs([WELCOME])} aria-label="Reset chat" title="Reset"><RotateCcw size={16} /></button>
          <button className="icon-btn" onClick={onClose} aria-label="Close chat"><X size={18} /></button>
        </header>

        <div className="chat__list" ref={listRef}>
          {msgs.map((m) => (
            <div key={m.id} className={`msg msg--${m.role}`}>
              <div className="msg__bubble">
                {m.role === "bot" ? <Markdown text={m.text.slice(0, m.shown)} /> : m.text}
              </div>
              {m.sources && m.sources.length > 0 && m.shown >= m.text.length && !(busy && m.id === last.id) && (
                <div className="msg__sources">
                  <FileSearch size={12} />
                  {m.sources.map((s) => (
                    <span key={s.title} className="source" title={`Relevance ${s.relevance}%`}>
                      {s.title} <b>{s.relevance}%</b>
                    </span>
                  ))}
                  {m.generated && <span className="source source--llm"><Sparkles size={10} /> LLM</span>}
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <div className="msg msg--bot">
              <div className="msg__bubble msg__bubble--thinking">
                <span className="mono">{llm === "ready" ? "retrieving · generating" : "searching resume"}</span>
                <span className="dots"><i /><i /><i /></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat__suggest">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} disabled={busy}>{s}</button>
          ))}
        </div>

        <form className="chat__input" onSubmit={submit}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Deepanshu…"
            aria-label="Your question"
            maxLength={300}
          />
          <button type="submit" className="btn btn--primary btn--icon" disabled={!input.trim() || busy} aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </aside>
    </>
  );
}
