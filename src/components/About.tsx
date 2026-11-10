import { BrainCircuit, Server, Zap } from "lucide-react";
import Section from "./Section.tsx";
import { profile, stats } from "../data/resume.ts";
import { CountUp } from "../fx.tsx";

const FOCUS = [
  { icon: BrainCircuit, title: "LLM orchestration", text: "LangGraph workflows across Claude, OpenAI and Gemini with routing, fallbacks and cost control." },
  { icon: Server, title: "Async backends", text: "FastAPI microservices and high-throughput ingestion pipelines, tested in CI." },
  { icon: Zap, title: "Retrieval & data", text: "RAG and embedding search with pgvector over PostgreSQL, MongoDB and Redis." },
];

export default function About() {
  return (
    <Section id="about" kicker="01 / about" title={<>Models are easy. <span className="gradient-text">Products are hard.</span></>}>
      <div className="bento">
        <div className="card bento__bio" data-reveal>
          <p>{profile.bio}</p>
          <div className="focus">
            {FOCUS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="focus__item">
                <span className="icon-chip"><Icon size={18} /></span>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {stats.map((s) => (
          <div key={s.label} className="card stat" data-reveal>
            <CountUp className="stat__value gradient-text" value={s.value} />
            <span className="stat__label">{s.label}</span>
            <span className="stat__note">{s.note}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
