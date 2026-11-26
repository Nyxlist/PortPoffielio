// A little burst wherever a visitor clicks: sparkles, hearts, stars, petals, confetti, a ripple,
// or her own emoji/text/picture. Pieces are plain elements that remove themselves when done.
import { useEffect, useRef } from "react";
import { safeImageUrl } from "../../lib/safe-url.js";

export const clickEffectOptions = [
  { value: "none", label: "None" },
  { value: "sparkles", label: "Sparkles" },
  { value: "hearts", label: "Hearts" },
  { value: "stars", label: "Stars" },
  { value: "petals", label: "Petals" },
  { value: "confetti", label: "Confetti" },
  { value: "ripple", label: "Ripple ring" },
  { value: "custom", label: "My own" },
];

const amounts = { few: 5, some: 9, lots: 14 };
const sizes = { s: 12, m: 18, l: 28 };

// Built-in shapes (fixed markup, no visitor or editor text inside).
const svg = (path, fill, view = "0 0 24 24") =>
  `<svg viewBox="${view}" width="100%" height="100%"><path d="${path}" fill="${fill}"/></svg>`;
const shapes = {
  sparkles: () =>
    svg(
      "M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z",
      "var(--color-accent)",
    ),
  hearts: () =>
    svg(
      "M12 21 C5 15 1 11 1 6.5 C1 3.4 3.4 1 6.5 1 C8.6 1 10.6 2.2 12 4 C13.4 2.2 15.4 1 17.5 1 C20.6 1 23 3.4 23 6.5 C23 11 19 15 12 21Z",
      "var(--color-primary)",
    ),
  stars: () =>
    svg(
      "M12 1 L15 9 L23 9 L17 14 L19 22 L12 17 L5 22 L7 14 L1 9 L9 9Z",
      "#ffd43b",
    ),
  petals: () =>
    svg("M10 1 C16 5 17 13 10 19 C3 13 4 5 10 1Z", "#ff9ec4", "0 0 20 20"),
  confetti: (i) =>
    `<span style="display:block;width:100%;height:60%;border-radius:2px;background:${["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "#ffd43b"][i % 4]}"></span>`,
};

function makePiece(config, i) {
  const el = document.createElement("span");
  el.className = "fx-piece";
  if (config.type === "custom") {
    const custom = config.custom ?? {};
    if (custom.kind === "image") {
      const src = safeImageUrl(custom.value);
      if (!src) return null;
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.style.cssText = "width:100%;height:100%;object-fit:contain";
      el.appendChild(img);
    } else {
      el.textContent = String(custom.value || "✨").slice(0, 12); // plain text, never code
      el.classList.add("fx-text");
    }
  } else {
    el.innerHTML = shapes[config.type]?.(i) ?? "";
  }
  return el;
}

/** Plays one burst at (x, y) inside `host` (a fixed .fx-layer). Also used by the editor's "try it" box. */
export function playBurst(host, config, x, y) {
  const type = config?.type ?? "none";
  if (!host || type === "none") return;
  if (type === "ripple") {
    const ring = document.createElement("span");
    ring.className = "fx-ripple";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.addEventListener("animationend", () => ring.remove());
    host.appendChild(ring);
    return;
  }
  const count = amounts[config.amount] ?? amounts.some;
  const size = sizes[config.size] ?? sizes.m;
  for (let i = 0; i < count; i++) {
    const piece = makePiece(config, i);
    if (!piece) continue;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const distance = 40 + Math.random() * 50;
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.fontSize = `${size}px`;
    piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--dy", `${Math.sin(angle) * distance - 20}px`);
    piece.style.setProperty("--rot", `${(Math.random() - 0.5) * 360}deg`);
    piece.addEventListener("animationend", () => piece.remove());
    host.appendChild(piece);
  }
}

/** Listens for clicks on the page and plays the chosen burst. Off inside the editor. */
export function ClickEffects({ config }) {
  const layer = useRef(null);
  const type = config?.type ?? "none";

  useEffect(() => {
    if (
      type === "none" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const onClick = (event) =>
      playBurst(layer.current, config, event.clientX, event.clientY);
    addEventListener("click", onClick);
    return () => removeEventListener("click", onClick);
  }, [
    type,
    config?.amount,
    config?.size,
    config?.custom?.kind,
    config?.custom?.value,
  ]);

  if (type === "none") return null;
  return <div ref={layer} className="fx-layer" aria-hidden="true" />;
}
