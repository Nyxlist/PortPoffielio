// Turns a block's "Style" settings into CSS. Colors are stored as either
// "theme:<name>" (follows the Theme) or "#rrggbb" (a fixed custom color).
import { safeImageUrl } from "../../lib/safe-url.js";
import { readableOn } from "../../lib/theme.js";

export const emptyStyle = {};

const isHex = (value) => /^#[0-9a-f]{6}$/i.test(value ?? "");

/** "theme:primary" → var(--color-primary), "#ff00aa" → #ff00aa, anything else → undefined. */
export function cssColor(value) {
  if (isHex(value)) return value;
  const theme = /^theme:([a-z0-9-]+)$/.exec(value ?? "");
  return theme ? `var(--color-${theme[1]})` : undefined;
}

/** Text color that stays readable on the chosen background, if she didn't pick one. */
function autoTextColor(bg) {
  if (/^theme:base-(100|200|300)$/.test(bg ?? ""))
    return "var(--color-base-content)";
  const theme = /^theme:(primary|secondary|accent|neutral)$/.exec(bg ?? "");
  if (theme) return `var(--color-${theme[1]}-content)`;
  if (isHex(bg)) return readableOn(bg);
  return undefined;
}

export const radiusValues = {
  none: "0",
  sm: "0.375rem",
  md: "0.75rem",
  lg: "1.5rem",
  xl: "2.5rem",
  pill: "9999px",
  theme: "var(--radius-box)",
};

export const shadowValues = {
  none: "none",
  sm: "0 1px 3px rgb(0 0 0 / 0.12)",
  md: "0 6px 18px rgb(0 0 0 / 0.14)",
  lg: "0 18px 45px rgb(0 0 0 / 0.2)",
  glow: "0 0 28px color-mix(in oklab, var(--color-primary) 55%, transparent)",
};

export const paddingValues = {
  none: "0",
  sm: "0.75rem",
  md: "1.5rem",
  lg: "2.5rem",
  xl: "4rem",
};

const quoteUrl = (url) => `url("${url.replaceAll('"', "%22")}")`;

const sizePattern = /^-?\d+(?:\.\d+)?(px|%|rem|em|vw|vh)$/;
/** A size with its unit ("24px", "50%"…). Older saves used preset names or plain numbers. */
const unitSize = (value, presets) =>
  presets?.[value] ??
  (typeof value === "number"
    ? `${value}px`
    : sizePattern.test(value ?? "")
      ? value
      : undefined);

/** Width: older saves stored a plain number meaning % of the space. */
const widthSize = (value) =>
  typeof value === "number"
    ? value < 100
      ? `${value}%`
      : undefined
    : unitSize(value);

/**
 * Returns `{ style }` for a wrapper element, or null when nothing is set.
 * `free`: the block is placed freely, so its own width/margins don't apply (the frame sets them).
 */
export function blockStyle(s = {}, { free = false } = {}) {
  const css = {};
  const bgColor = cssColor(s.bg);
  const bgTo = cssColor(s.bgTo);
  const layers = [];
  const image = safeImageUrl(s.bgImage);

  if (image) {
    const tint = Math.max(0, Math.min(90, s.bgTint ?? 30)) / 100;
    const tintColor = s.bgTintLight ? "255 255 255" : "0 0 0";
    if (tint)
      layers.push(
        `linear-gradient(rgb(${tintColor} / ${tint}), rgb(${tintColor} / ${tint}))`,
      );
    layers.push(quoteUrl(image));
    css.backgroundSize =
      s.bgFit === "contain" ? "contain" : s.bgFit === "tile" ? "auto" : "cover";
    css.backgroundRepeat = s.bgFit === "tile" ? "repeat" : "no-repeat";
    css.backgroundPosition = `${s.bgX ?? 50}% ${s.bgY ?? 50}%`;
    if (s.bgFixed) css.backgroundAttachment = "fixed";
  }
  if (bgColor && bgTo)
    layers.push(`linear-gradient(${s.bgAngle ?? 135}deg, ${bgColor}, ${bgTo})`);
  if (layers.length) css.backgroundImage = layers.join(", ");
  if (bgColor) css.backgroundColor = bgColor;

  const text =
    cssColor(s.text) ??
    (image && (s.bgTint ?? 30) >= 35 && !s.bgTintLight
      ? "#ffffff"
      : autoTextColor(s.bg));
  if (text) css.color = text;

  if (s.radius && s.radius !== "none")
    css.borderRadius = unitSize(s.radius, radiusValues);
  if (s.borderWidth > 0) {
    css.border = `${s.borderWidth}px ${s.borderStyle ?? "solid"} ${cssColor(s.borderColor) ?? "var(--color-base-300)"}`;
  }
  if (s.shadow && s.shadow !== "none") css.boxShadow = shadowValues[s.shadow];
  if (s.padding && s.padding !== "none")
    css.padding = unitSize(s.padding, paddingValues);
  if (s.padX) css.paddingInline = unitSize(s.padX);
  if (s.padY) css.paddingBlock = unitSize(s.padY);
  const width = widthSize(s.width);
  if (width && !free) {
    css.width = width;
    css.maxWidth = "100%";
    css.marginLeft = s.align === "left" ? 0 : "auto";
    css.marginRight = s.align === "right" ? 0 : "auto";
  }
  if (unitSize(s.height)) css.minHeight = unitSize(s.height);
  if (!free && unitSize(s.marginTop)) css.marginTop = unitSize(s.marginTop);
  if (!free && unitSize(s.marginBottom))
    css.marginBottom = unitSize(s.marginBottom);
  if (s.opacity != null && s.opacity < 100) css.opacity = s.opacity / 100;
  if (s.rotate) css.transform = `rotate(${s.rotate}deg)`;
  if (css.borderRadius && (image || bgColor)) css.overflow = "hidden";

  return Object.keys(css).length ? { style: css } : null;
}
