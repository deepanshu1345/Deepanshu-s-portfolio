import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar.tsx";
import Hero from "./components/Hero.tsx";
import About from "./components/About.tsx";
import Experience from "./components/Experience.tsx";
import Projects from "./components/Projects.tsx";
import Skills from "./components/Skills.tsx";
import Education from "./components/Education.tsx";
import Contact from "./components/Contact.tsx";
import ChatWidget from "./components/ChatWidget.tsx";
import Footer from "./components/Footer.tsx";
import Cursor from "./components/Cursor.tsx";

export type OpenChat = (question?: string) => void;

export default function App() {
  const [chat, setChat] = useState<{ open: boolean; question?: string; nonce: number }>({ open: false, nonce: 0 });
  const openChat = useCallback<OpenChat>((question) => setChat((c) => ({ open: true, question, nonce: c.nonce + 1 })), []);

  // Reveal-on-scroll + card spotlight.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => (io.disconnect(), window.removeEventListener("pointermove", onMove));
  }, []);

  return (
    <>
      <div className="bg-aurora" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
      <Cursor />
      <Navbar openChat={openChat} />
      <main>
        <Hero openChat={openChat} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact openChat={openChat} />
      </main>
      <Footer />
      <ChatWidget
        open={chat.open}
        question={chat.question}
        nonce={chat.nonce}
        onOpen={() => openChat()}
        onClose={() => setChat((c) => ({ ...c, open: false, question: undefined }))}
      />
    </>
  );
}
