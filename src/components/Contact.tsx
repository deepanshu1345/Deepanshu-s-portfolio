import { useState } from "react";
import { Check, Copy, Mail, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons.tsx";
import { profile } from "../data/resume.ts";
import { Scramble, Typed } from "../fx.tsx";
import type { OpenChat } from "../App.tsx";

export default function Contact({ openChat }: { openChat: OpenChat }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="card contact" data-reveal>
          <Scramble className="kicker mono" text="06 / contact" />
          <h2>Let's build something <span className="gradient-text">intelligent</span>.</h2>
          <p className="muted">Hiring for an AI or backend role, or have an idea worth prototyping? My inbox is open.</p>

          <div className="term mono">
            <div><span className="term__prompt">&gt;</span> deepanshu.contact()</div>
            <div className="term__out">
              {"{"}<br />
              &nbsp;&nbsp;email: "<Typed className="term__str" text={profile.email} />"<span className="caret" />,<br />
              &nbsp;&nbsp;location: <span className="term__str">"{profile.location}"</span>,<br />
              &nbsp;&nbsp;status: <span className="term__str">"{profile.available ? "open to AI engineering roles" : "not looking"}"</span><br />
              {"}"}
            </div>
            <button className={`term__copy ${copied ? "on" : ""}`} onClick={copy} aria-label="Copy email">
              {copied ? <><Check size={14} /> copied</> : <><Copy size={14} /> copy</>}
            </button>
          </div>

          <div className="contact__actions">
            <a className="btn btn--primary btn--lg" href={`mailto:${profile.email}`}><Mail size={18} /> Say hello</a>
            <button className="btn btn--ghost btn--lg" onClick={() => openChat("Why hire Deepanshu?")}><Sparkles size={18} /> Ask the AI why</button>
          </div>
          <div className="contact__links">
            <a href={profile.github} target="_blank" rel="noreferrer"><GithubIcon /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon /> LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}
