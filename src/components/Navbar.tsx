import { useEffect, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { profile } from "../data/resume.ts";
import type { OpenChat } from "../App.tsx";

const LINKS = ["About", "Experience", "Projects", "Skills", "Contact"];

export default function Navbar({ openChat }: { openChat: OpenChat }) {
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");
  useEffect(() => {
    const root = document.documentElement;
    const on = () => {
      setScrolled(window.scrollY > 24);
      root.style.setProperty("--progress", String(scrollY / Math.max(1, root.scrollHeight - innerHeight)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });

    // Active section = the one crossing the upper third of the screen.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-30% 0px -65% 0px" },
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => (window.removeEventListener("scroll", on), io.disconnect());
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <span className="nav__progress" aria-hidden="true" />
      <a href="#top" className="nav__brand" aria-label="Home">
        <span className="nav__logo">DL</span>
        <span className="nav__name">{profile.name}</span>
      </a>
      <nav className="nav__links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className={current === l.toLowerCase() ? "on" : ""} aria-current={current === l.toLowerCase() ? "true" : undefined}>{l}</a>
        ))}
      </nav>
      <div className="nav__actions">
        <a className="btn btn--ghost btn--sm" href={profile.resumePdf} download>
          <FileText size={15} /> <span className="hide-sm">Resume</span>
        </a>
        <button className="btn btn--primary btn--sm" onClick={() => openChat()}>
          <Sparkles size={15} /> Ask AI
        </button>
      </div>
    </header>
  );
}
