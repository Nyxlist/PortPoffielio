// Turns the saved theme (colors, font, rounding) into the CSS variables daisyUI and Tailwind read.

export const fonts = {
  Nunito: '"Nunito Variable", ui-sans-serif, system-ui, sans-serif',
  Quicksand: '"Quicksand Variable", ui-sans-serif, system-ui, sans-serif',
  Fredoka: '"Fredoka Variable", ui-sans-serif, system-ui, sans-serif',
  Poppins: "Poppins, ui-sans-serif, system-ui, sans-serif",
  Caprasimo: '"Caprasimo", ui-serif, Georgia, serif',
  "Plus Jakarta Sans":
    '"Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif',
};

export const radiusPresets = {
  sharp: {
    label: "Sharp",
    selector: "0.25rem",
    field: "0.25rem",
    box: "0.25rem",
  },
  soft: { label: "Soft", selector: "0.5rem", field: "0.5rem", box: "0.75rem" },
  round: { label: "Round", selector: "1rem", field: "0.75rem", box: "1.25rem" },
  bubbly: { label: "Bubbly", selector: "2rem", field: "1.5rem", box: "2rem" },
};

/** The colors she can pick. Text colors that sit on top of them are worked out automatically. */
export const themeColors = [
  { key: "primary", label: "Main color" },
  { key: "secondary", label: "Second color" },
  { key: "accent", label: "Accent color" },
  { key: "base-100", label: "Page background" },
  { key: "base-200", label: "Card background" },
  { key: "base-300", label: "Borders" },
  { key: "base-content", label: "Text" },
];

/** Black or white, whichever reads better on `hex`. */
export function readableOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#1f1720" : "#ffffff";
}

const FALLBACK = "ui-sans-serif, system-ui, sans-serif";
const SAFE_FONT_SRC =
  /^data:font\/(woff2|woff|ttf|otf);base64,[A-Za-z0-9+/=]+$/;
const safeFontId = (id) => String(id).replace(/[^a-z0-9]/gi, "");

/** Built-in font names, or "custom:<id>" for a font she uploaded. */
export function fontFamily(choice, theme) {
  if (fonts[choice]) return fonts[choice];
  const id = /^custom:(.+)$/.exec(choice ?? "")?.[1];
  const font = id && theme.customFonts?.find((f) => f.id === id);
  return font ? `"custom-${safeFontId(font.id)}", ${FALLBACK}` : fonts.Nunito;
}

/** @font-face rules for her uploaded fonts. Only well-formed font files are included. */
export function customFontCss(theme) {
  return (theme.customFonts ?? [])
    .filter((f) => SAFE_FONT_SRC.test(f.src))
    .map(
      (f) =>
        `@font-face{font-family:"custom-${safeFontId(f.id)}";src:url("${f.src}");font-display:swap;}`,
    )
    .join("\n");
}

/** Optional picture behind the whole site, softened with the page color so text stays readable. */
export function pageBackgroundStyle(theme) {
  const bg = theme.pageBackground;
  if (!bg?.image || !/^(https?:|data:image\/|\/)/i.test(bg.image)) return {};
  const soften = Math.max(0, Math.min(95, bg.soften ?? 70));
  const veil = `color-mix(in srgb, var(--color-base-100) ${soften}%, transparent)`;
  return {
    backgroundImage: `linear-gradient(${veil}, ${veil}), url("${bg.image.replaceAll('"', "%22")}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: bg.fixed ? "fixed" : undefined,
  };
}

export function themeToCssVars(theme) {
  const { colors } = theme;
  const radius = radiusPresets[theme.radius] ?? radiusPresets.round;
  const vars = {
    "--font-sans": fontFamily(theme.font, theme),
    "--font-heading": fontFamily(theme.headingFont ?? theme.font, theme),
    "--radius-selector": radius.selector,
    "--radius-field": radius.field,
    "--radius-box": radius.box,
    "--color-neutral": colors["base-content"],
    "--color-neutral-content": colors["base-100"],
  };
  for (const { key } of themeColors) vars[`--color-${key}`] = colors[key];
  for (const key of ["primary", "secondary", "accent"])
    vars[`--color-${key}-content`] = readableOn(colors[key]);
  return vars;
}
