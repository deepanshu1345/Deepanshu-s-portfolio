import type { ReactNode } from "react";
import { Scramble } from "../fx.tsx";

export default function Section({ id, kicker, title, children }: { id: string; kicker: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="section" id={id}>
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="section__num" aria-hidden="true">{kicker.split(" ")[0]}</span>
          <Scramble className="kicker mono" text={kicker} />
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
