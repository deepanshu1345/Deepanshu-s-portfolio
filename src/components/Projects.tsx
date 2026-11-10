import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import Section from "./Section.tsx";
import { GithubIcon } from "./BrandIcons.tsx";
import { profile, projects } from "../data/resume.ts";

// Architecture as nodes; a pulse travels along the links.
function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="flow" aria-label={`Architecture: ${steps.join(" → ")}`}>
      {steps.map((s, i) => (
        <span key={s} className="flow__step" style={{ "--i": i } as CSSProperties}>
          {i > 0 && <i className="flow__link" />}
          <span className="flow__node mono">{s}</span>
        </span>
      ))}
    </div>
  );
}

export default function Projects() {
  return (
    <Section id="projects" kicker="03 / projects" title="Selected work">
      <div className="projects">
        {projects.map((p, i) => {
          const [num, ...label] = p.metric?.split(" ") ?? [];
          return (
            <article key={p.name} className={`card project ${i === 0 ? "project--featured" : ""}`} data-reveal>
              <div className="project__head">
                <span className="mono muted">0{i + 1}</span>
                {p.metric && (
                  <span className="project__metric">
                    <b>{num}</b>
                    <small className="mono">{label.join(" ")}</small>
                  </span>
                )}
              </div>
              <h3>{p.name}</h3>
              <p className="project__tagline gradient-text">{p.tagline}</p>
              <Flow steps={p.flow} />
              <p className="muted">{p.description}</p>
              <ul className="ticks">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
              <div className="tags">{p.stack.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            </article>
          );
        })}
        <a className="card project project--more" href={profile.github} target="_blank" rel="noreferrer" data-reveal>
          <GithubIcon size={28} />
          <h3>More on GitHub</h3>
          <p className="muted">LLM experiments, RAG prototypes and backend side projects.</p>
          <span className="link">View repositories <ArrowUpRight size={16} /></span>
        </a>
      </div>
    </Section>
  );
}
