import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import Section from "./Section.tsx";
import { experience } from "../data/resume.ts";

export default function Experience() {
  const ref = useRef<HTMLOListElement>(null);

  // Fill the timeline line as it scrolls past the middle of the screen.
  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      el.style.setProperty("--fill", p.toFixed(3));
    };
    const onScroll = () => (cancelAnimationFrame(raf), (raf = requestAnimationFrame(update)));
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => (cancelAnimationFrame(raf), removeEventListener("scroll", onScroll));
  }, []);

  return (
    <Section id="experience" kicker="02 / experience" title="Where I've shipped">
      <ol className="timeline" ref={ref}>
        {experience.map((e) => (
          <li key={e.company} className="timeline__item" data-reveal>
            <span className="timeline__dot" />
            <div className="card timeline__card">
              <div className="timeline__top">
                <div>
                  <h3>
                    {e.role}
                    {e.period.includes("Present") && <span className="badge timeline__active"><span className="pulse" /> active</span>}
                  </h3>
                  <p className="timeline__company">{e.company}</p>
                </div>
                <div className="timeline__meta">
                  <span className="mono">{e.period}</span>
                  <span className="muted"><MapPin size={13} /> {e.location}</span>
                </div>
              </div>
              <ul className="ticks">
                {e.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
              <div className="tags">{e.stack.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
