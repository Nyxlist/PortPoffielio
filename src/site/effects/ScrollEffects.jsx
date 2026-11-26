// Scroll effects: sections animate in when they come into view, a progress bar along the top,
// and a --scroll-progress value (0 → 1) that the scene's parallax uses.
import { useEffect, useState } from "react";

export const revealOptions = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade in" },
  { value: "rise", label: "Rise up" },
  { value: "zoom", label: "Zoom in" },
  { value: "slide", label: "Slide in" },
  { value: "blur", label: "Unblur" },
];

export function ScrollEffects({ config, slug }) {
  const reveal = config?.reveal ?? "none";
  const [progress, setProgress] = useState(0);

  // Track how far down the page the visitor is.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const value = max > 0 ? Math.min(1, scrollY / max) : 0;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        value.toFixed(4),
      );
      setProgress(value);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [slug]);

  // Reveal each section the first time it scrolls into view (re-run when the page changes).
  useEffect(() => {
    if (reveal === "none") return;
    const sections = [...document.querySelectorAll("main section")];
    if (!("IntersectionObserver" in window)) {
      sections.forEach((s) => s.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [reveal, slug]);

  if (!config?.progressBar) return null;
  return (
    <div
      className="fx-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  );
}
