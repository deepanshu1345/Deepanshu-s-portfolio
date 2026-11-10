import { GraduationCap } from "lucide-react";
import Section from "./Section.tsx";
import { education } from "../data/resume.ts";

export default function Education() {
  return (
    <Section id="education" kicker="05 / education" title="Education">
      <div className="edu">
        {education.map((e) => (
          <div key={e.degree} className="card edu__card" data-reveal>
            <span className="icon-chip"><GraduationCap size={18} /></span>
            <div className="edu__body">
              <h3>{e.degree}</h3>
              <p className="muted">{e.institution}, {e.location}</p>
            </div>
            <div className="edu__meta">
              <span className="mono">{e.period}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
