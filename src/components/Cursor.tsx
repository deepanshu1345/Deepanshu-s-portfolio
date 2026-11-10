// Lime ring that trails the pointer and grows over clickable things. Desktop only.
import { useEffect, useRef } from "react";
import { reducedMotion } from "../fx.tsx";

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || reducedMotion()) return;
    const el = ref.current!;
    const pos = { x: -100, y: -100 }, at = { x: -100, y: -100 };
    let raf = 0;
    const tick = () => {
      at.x += (pos.x - at.x) * 0.2;
      at.y += (pos.y - at.y) * 0.2;
      el.style.transform = `translate(${at.x}px, ${at.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      el.classList.toggle("on", !!(e.target as Element).closest("a, button, input, [role=button]"));
    };
    el.hidden = false;
    addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => (cancelAnimationFrame(raf), removeEventListener("pointermove", onMove));
  }, []);

  return <div ref={ref} className="cursor" hidden aria-hidden="true" />;
}
