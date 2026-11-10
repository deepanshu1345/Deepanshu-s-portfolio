import { useEffect, useState } from "react";

const clock = () =>
  new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());

export default function Footer() {
  const [time, setTime] = useState(clock);
  useEffect(() => {
    const t = setInterval(() => setTime(clock()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="footer mono">
      <span>© {new Date().getFullYear()} Deepanshu Lakde</span>
      <span className="footer__status"><span className="pulse" /> all systems normal · RAG runs in your browser</span>
      <span>Pune <b>{time}</b> IST</span>
    </footer>
  );
}
