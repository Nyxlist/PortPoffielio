// Text settings (size, weight, spacing, font, fill) and animations, turned into CSS.
// Sizes are stored with their unit, e.g. "48px", "3rem", "5vw", "120%".
import { safeImageUrl } from "../../lib/safe-url.js";
import { fonts } from "../../lib/theme.js";
import { cssColor } from "./block-style.js";

const unitPattern = /^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh)$/;

/** "48px" → { value: 48, unit: "px" }; anything else → null. */
export function parseUnit(text) {
  const match = unitPattern.exec(String(text ?? ""));
  return match ? { value: Number(match[1]), unit: match[2] } : null;
}
/** Only lets through well-formed sizes, so nothing odd ends up in the page's CSS. */
export const cssSize = (text) => (parseUnit(text) ? text : undefined);

export const textShadows = {
  none: undefined,
  soft: "0 2px 8px rgb(0 0 0 / 0.25)",
  hard: "3px 3px 0 var(--ts-shadow, rgb(0 0 0 / 0.35))",
  glow: "0 0 12px var(--ts-shadow, var(--color-primary)), 0 0 28px var(--ts-shadow, var(--color-primary))",
  pop: "2px 2px 0 var(--color-base-100), 4px 4px 0 var(--ts-shadow, var(--color-primary))",
};

export const animations = [
  { value: "none", label: "None" },
  { value: "fade-up", label: "Fade up" },
  { value: "slide-left", label: "Slide in" },
  { value: "pop", label: "Pop" },
  { value: "bounce", label: "Bounce" },
  { value: "typewriter", label: "Typewriter" },
  { value: "blur-in", label: "Blur in" },
  { value: "float", label: "Float" },
  { value: "wiggle", label: "Wiggle" },
  { value: "pulse", label: "Pulse" },
  { value: "glow", label: "Glow" },
  { value: "rainbow", label: "Rainbow" },
  { value: "shake", label: "Shake" },
  { value: "flicker", label: "Flicker" },
];
export const animationTriggers = [
  { value: "view", label: "When it scrolls into view" },
  { value: "hover", label: "On hover" },
  { value: "loop", label: "Always (loop)" },
];
const knownAnimations = new Set(animations.map((a) => a.value));

/** "heading" / "body" follow the theme; a font name or "custom:<id>" picks one font. */
function blockFont(choice) {
  if (choice === "heading") return "var(--font-heading, var(--font-sans))";
  if (choice === "body") return "var(--font-sans)";
  if (fonts[choice]) return fonts[choice];
  const id = /^custom:([a-z0-9-]+)$/i.exec(choice ?? "")?.[1];
  return id
    ? `"custom-${id.replace(/[^a-z0-9]/gi, "")}", ui-sans-serif, sans-serif`
    : undefined;
}

const quoteUrl = (url) => `url("${url.replaceAll('"', "%22")}")`;

/** Returns { className, style } for the text layer of a block, or null when nothing is set. */
export function textStyle(s = {}) {
  const css = {};
  const classes = [];
  const size = cssSize(s.fontSize);
  if (size) ((css.fontSize = size), classes.push("ts-size"));
  if (s.fontWeight)
    ((css.fontWeight = s.fontWeight), classes.push("ts-weight"));
  const spacing = cssSize(s.letterSpacing);
  if (spacing) ((css.letterSpacing = spacing), classes.push("ts-ls"));
  if (s.lineHeight)
    ((css.lineHeight = s.lineHeight / 100), classes.push("ts-lh"));
  if (blockFont(s.font))
    ((css.fontFamily = blockFont(s.font)), classes.push("ts-ff"));
  if (s.italic) css.fontStyle = "italic";
  if (s.textCase && s.textCase !== "none") css.textTransform = s.textCase;
  if (s.textAlign) ((css.textAlign = s.textAlign), classes.push("ts-align"));
  if (s.strokeWidth > 0) {
    css.WebkitTextStroke = `${s.strokeWidth}px ${cssColor(s.strokeColor) ?? "var(--color-base-content)"}`;
    css.paintOrder = "stroke fill";
  }
  if (s.textShadow && textShadows[s.textShadow]) {
    css.textShadow = textShadows[s.textShadow];
    if (cssColor(s.shadowColor)) css["--ts-shadow"] = cssColor(s.shadowColor);
  }

  const fill = s.textFill ?? {};
  const image = fill.type === "image" && safeImageUrl(fill.image);
  const from = cssColor(fill.from) ?? "var(--color-primary)";
  const to = cssColor(fill.to) ?? "var(--color-secondary)";
  if (image) {
    css.backgroundImage = quoteUrl(image);
    css.backgroundSize = fill.size ? `${fill.size}%` : "cover";
    css.backgroundPosition = `${fill.x ?? 50}% ${fill.y ?? 50}%`;
  } else if (fill.type === "gradient") {
    css.backgroundImage = `linear-gradient(${fill.angle ?? 90}deg, ${from}, ${to}, ${from})`;
    css.backgroundSize = "200% 100%";
  }
  if (css.backgroundImage) classes.push("ts-fill");

  const anim = s.anim ?? {};
  if (knownAnimations.has(anim.type) && anim.type !== "none") {
    classes.push(`ta ta-${anim.type} ta-on-${anim.trigger ?? "view"}`);
    css["--ta-time"] = `${Math.max(0.2, Math.min(10, anim.speed ?? 1))}s`;
    css["--ta-delay"] = `${Math.max(0, Math.min(10, anim.delay ?? 0))}s`;
  }

  if (!classes.length && !Object.keys(css).length) return null;
  return { className: classes.join(" "), style: css };
}
