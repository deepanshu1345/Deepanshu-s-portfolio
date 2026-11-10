// Small shared UI effects. All respect prefers-reduced-motion.
import { useEffect, useRef, useState, type RefObject } from "react";

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True once the element has scrolled into view. */
export function useInView<T extends Element>(ref: RefObject<T | null>, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

/** Runs `frame(progress 0→1)` over `ms` once `start` is true. */
function useTween(start: boolean, ms: number, frame: (p: number) => void) {
  useEffect(() => {
    if (!start) return;
    if (reducedMotion()) return frame(1);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      frame(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*";

/** Text that settles from random glyphs into place when scrolled into view. */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  useTween(useInView(ref), 700, (p) => {
    const n = Math.floor(p * text.length);
    setOut(text.slice(0, n) + [...text.slice(n)].map((c) => (/[\s/]/.test(c) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""));
  });
  return <span ref={ref} className={className} aria-label={text}>{out}</span>;
}

/** Counts the number inside a value like "50K+" or "−30%" up from 0. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [, pre, num, post] = value.match(/^(\D*)([\d.]+)(.*)$/) ?? [, "", "", value];
  const [n, setN] = useState(0);
  useTween(useInView(ref), 1200, (p) => setN(Number(num) * (1 - (1 - p) ** 3)));
  return <span ref={ref} className={className}>{num ? `${pre}${Math.round(n)}${post}` : value}</span>;
}

/** Types `text` out once scrolled into view. */
export function Typed({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useTween(useInView(ref), text.length * 45, (p) => setN(Math.round(p * text.length)));
  return <span ref={ref} className={className} aria-label={text}>{text.slice(0, n)}</span>;
}
