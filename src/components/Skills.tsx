import { useState } from "react";
import { BrainCircuit, Code2, Database, Server } from "lucide-react";
import Section from "./Section.tsx";
import { experience, projects, skillGroups } from "../data/resume.ts";

const ICONS = [BrainCircuit, Server, Database, Code2];

// Where a skill shows up: any role or project whose stack mentions it.
const PLACES = [
  ...experience.map((e) => ({ name: e.company, stack: e.stack })),
  ...projects.map((p) => ({ name: p.name, stack: p.stack })),
];
const usedIn = (skill: string) => {
  const s = skill.toLowerCase();
  return PLACES.filter((p) => p.stack.some((t) => { const x = t.toLowerCase(); return x === s || x.includes(s) || s.includes(x); })).map((p) => p.name);
};

export default function Skills() {
  const [active, setActive] = useState<string | null>(null);
  const places = active ? usedIn(active) : [];

  return (
    <Section id="skills" kicker="04 / skills" title="Toolkit">
      <div className="card skillmap" data-reveal onMouseLeave={() => setActive(null)}>
        <div className="skillmap__groups">
          {skillGroups.map((g, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={g.name} className="skillmap__group">
                <div className="skill-group__head">
                  <span className="icon-chip"><Icon size={18} /></span>
                  <h3>{g.name}</h3>
                </div>
                <ul className="skillmap__list">
                  {g.items.map((s) => (
                    <li key={s}>
                      <button
                        className={`skillmap__skill ${active === s ? "on" : ""} ${usedIn(s).length ? "used" : ""}`}
                        onMouseEnter={() => setActive(s)}
                        onFocus={() => setActive(s)}
                        onClick={() => setActive(s)}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="skillmap__readout mono" aria-live="polite">
          <span className="skillmap__prompt">&gt;</span>
          {!active ? (
            <span className="muted">hover a skill to trace where it shipped</span>
          ) : places.length ? (
            <>
              <b>{active}</b> <span className="muted">→</span>
              {places.map((p) => <span key={p} className="skillmap__place">{p}</span>)}
            </>
          ) : (
            <><b>{active}</b> <span className="muted">→ in the toolkit, not in a listed project yet</span></>
          )}
        </div>
      </div>
    </Section>
  );
}
