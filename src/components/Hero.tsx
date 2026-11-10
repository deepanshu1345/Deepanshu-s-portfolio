import { FileText, MapPin, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import EmbeddingSpace from "./EmbeddingSpace.tsx";
import GlassBox from "./GlassBox.tsx";
import { GithubIcon, LinkedinIcon } from "./BrandIcons.tsx";
import { profile } from "../data/resume.ts";
import type { OpenChat } from "../App.tsx";

// Headline words blur in one by one; the accent words land last.
const LINES = [["I", "build", "LLM", "systems"], ["you", "can", "*see", "*inside."]];

export default function Hero({ openChat }: { openChat: OpenChat }) {
  let i = 0;
  return (
    <section className="hero" id="top">
      <div className="container">
        <EmbeddingSpace />
        <div className="hero__head">
          <div className="hero__copy">
            <div className="hero__kicker mono" data-reveal>
              <span>{profile.name}</span>
              <span>{profile.role}</span>
              {profile.available && <span className="hero__open"><span className="pulse" /> open to roles</span>}
            </div>
            <h1 className="hero__title">
              {LINES.map((line, l) => (
                <span key={l} className="hero__line">
                  {line.map((w) => (
                    <span key={w} className={`w ${w.startsWith("*") ? "gradient-text" : ""}`} style={{ "--i": i++ } as CSSProperties}>
                      {w.replace("*", "")}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
          </div>
          <div className="hero__side" data-reveal>
            <p className="hero__lead">{profile.tagline}</p>
            <div className="hero__ctas">
              <button className="btn btn--primary" onClick={() => openChat()}>
                <Sparkles size={16} /> Chat with my resume
              </button>
              <a className="btn btn--ghost" href={profile.resumePdf} download>
                <FileText size={16} /> Download CV
              </a>
            </div>
            <div className="hero__meta">
              <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /></a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon /></a>
              <span className="muted"><MapPin size={14} /> {profile.location}</span>
            </div>
          </div>
        </div>

        <p className="hero__hint mono" data-reveal>
          ↓ This is the RAG pipeline behind my resume chatbot, running in your browser. Type a question and watch every step.
        </p>
        <GlassBox openChat={openChat} />
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((k) => (
            <span key={k}>
              {["LangGraph", "Claude", "OpenAI", "Gemini", "Agentic AI", "RAG", "FastAPI", "AsyncIO", "pgvector", "PostgreSQL", "Redis", "Docker", "Pytest"].map((t) => (
                <em key={t}>{t}<b>/</b></em>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
