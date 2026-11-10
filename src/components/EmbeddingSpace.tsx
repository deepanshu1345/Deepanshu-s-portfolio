// Hero visual: resume chunks as points in a slowly rotating "embedding space".
// Lights up the chunks the Glass Box retrieves (via the "rag:hits" window event).
import { useEffect, useRef } from "react";
import { chunks } from "../rag/knowledge.ts";
import { reducedMotion } from "../fx.tsx";

const SECTIONS = ["profile", "experience", "projects", "skills", "education", "contact"];
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Chunks cluster by section; dust fills the space.
const POINTS = chunks.map((c, i) => {
  const a = (SECTIONS.indexOf(c.section) / SECTIONS.length) * Math.PI * 2;
  return {
    id: c.id, title: c.title, section: c.section,
    x: Math.cos(a) * 0.75 + (rnd(i) - 0.5) * 0.45,
    y: (rnd(i + 50) - 0.5) * 1.1,
    z: Math.sin(a) * 0.75 + (rnd(i + 99) - 0.5) * 0.45,
  };
});
const DUST = Array.from({ length: 80 }, (_, i) => ({ x: (rnd(i + 200) - 0.5) * 2.4, y: (rnd(i + 400) - 0.5) * 1.6, z: (rnd(i + 600) - 0.5) * 2.4 }));

export default function EmbeddingSpace() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = reducedMotion();
    let w = 0, h = 0, angle = 0.6, raf = 0, visible = true;
    let hits: string[] = [];

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: { x: number; y: number; z: number }) => {
      const c = Math.cos(angle), s = Math.sin(angle);
      const x = p.x * c - p.z * s, z = p.x * s + p.z * c;
      const k = 2.6 / (2.6 + z), r = Math.min(w, h) * 0.42;
      return { sx: w / 2 + x * r * k, sy: h / 2 + p.y * r * k, k };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of DUST) {
        const { sx, sy, k } = project(d);
        ctx.fillStyle = `rgba(233,235,230,${0.12 * k})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }
      const pts = POINTS.map((p) => ({ ...p, ...project(p), hit: hits.indexOf(p.id) }));

      // Same-section links.
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++)
          if (pts[i].section === pts[j].section) {
            ctx.strokeStyle = "rgba(233,235,230,0.1)";
            ctx.beginPath(); ctx.moveTo(pts[i].sx, pts[i].sy); ctx.lineTo(pts[j].sx, pts[j].sy); ctx.stroke();
          }

      // Query at the origin, wired to its hits.
      const q = project({ x: 0, y: 0, z: 0 });
      if (hits.length) {
        ctx.strokeStyle = "rgba(212,255,58,0.55)";
        ctx.lineWidth = 1;
        for (const p of pts) if (p.hit >= 0) { ctx.beginPath(); ctx.moveTo(q.sx, q.sy); ctx.lineTo(p.sx, p.sy); ctx.stroke(); }
        ctx.fillStyle = "#d4ff3a";
        ctx.fillRect(q.sx - 6, q.sy - 0.5, 12, 1);
        ctx.fillRect(q.sx - 0.5, q.sy - 6, 1, 12);
      }

      ctx.font = "11px 'Geist Mono', monospace";
      for (const p of pts) {
        const lit = p.hit >= 0;
        ctx.fillStyle = lit ? "#d4ff3a" : `rgba(233,235,230,${0.35 + 0.35 * p.k})`;
        ctx.shadowColor = "#d4ff3a";
        ctx.shadowBlur = lit ? 14 : 0;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, (lit ? 4 : 2.4) * p.k, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (lit) ctx.fillText(`#${p.hit + 1} ${p.title.length > 26 ? p.title.slice(0, 25) + "…" : p.title}`, p.sx + 9, p.sy + 4);
      }

      if (!still) angle += 0.0018;
      if (visible && !still) raf = requestAnimationFrame(draw);
    };

    const onHits = (e: Event) => {
      hits = (e as CustomEvent<string[]>).detail;
      if (still) draw();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) draw();
    });
    const ro = new ResizeObserver(() => (resize(), draw()));

    resize();
    io.observe(canvas);
    ro.observe(canvas);
    window.addEventListener("rag:hits", onHits);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("rag:hits", onHits);
    };
  }, []);

  return <canvas ref={ref} className="hero__space" aria-hidden="true" />;
}
