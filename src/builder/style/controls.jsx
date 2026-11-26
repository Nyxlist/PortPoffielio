// Small building blocks for the block settings panel: color swatches, button groups, sliders.
import { themeColors } from "../../lib/theme.js";
import { useSite } from "./site-context.js";

const label = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};
const row = { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" };

export function Control({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={label}>{title}</span>
      {children}
    </div>
  );
}

/** A collapsible group of controls. */
export function Group({ title, open = false, children }) {
  return (
    <details
      open={open}
      style={{ borderTop: "1px solid #e4e4e7", padding: "10px 0" }}
    >
      <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
        {title}
      </summary>
      <div style={{ paddingTop: 12 }}>{children}</div>
    </details>
  );
}

/** Buttons where exactly one is chosen. */
export function Segmented({ options, value, onChange }) {
  return (
    <div style={row}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            title={o.title ?? o.label}
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            style={{
              padding: "4px 9px",
              fontSize: 12,
              borderRadius: 6,
              border: `1px solid ${active ? "#2563eb" : "#d4d4d8"}`,
              background: active ? "#eff6ff" : "#fff",
              color: active ? "#1d4ed8" : "#27272a",
              fontWeight: active ? 700 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Slider({ min, max, step = 1, value, onChange, suffix = "" }) {
  return (
    <div style={{ ...row, flexWrap: "nowrap" }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ width: 44, textAlign: "right", fontSize: 12 }}>
        {value}
        {suffix}
      </span>
    </div>
  );
}

const swatch = (active) => ({
  width: 26,
  height: 26,
  borderRadius: 999,
  border: active ? "3px solid #2563eb" : "1px solid #d4d4d8",
  boxShadow: active ? "0 0 0 2px #fff inset" : "none",
  cursor: "pointer",
  padding: 0,
});

/**
 * Pick a theme color (follows the Theme), any custom color, or none.
 * Value: "" | "theme:<name>" | "#rrggbb".
 */
export function ColorChoice({ value = "", onChange, noneLabel = "None" }) {
  const site = useSite();
  const colors = site?.theme?.colors ?? {};
  const custom = /^#[0-9a-f]{6}$/i.test(value) ? value : "";
  return (
    <div style={row}>
      <button
        type="button"
        title={noneLabel}
        aria-pressed={!value}
        onClick={() => onChange("")}
        style={{
          ...swatch(!value),
          background:
            "repeating-linear-gradient(45deg,#fff 0 4px,#e4e4e7 4px 8px)",
        }}
      />
      {themeColors.map(({ key, label: name }) => (
        <button
          key={key}
          type="button"
          title={`${name} (follows your theme)`}
          aria-pressed={value === `theme:${key}`}
          onClick={() => onChange(`theme:${key}`)}
          style={{
            ...swatch(value === `theme:${key}`),
            background: colors[key] ?? "#ccc",
          }}
        />
      ))}
      <label
        title="Any color"
        style={{
          ...swatch(!!custom),
          overflow: "hidden",
          position: "relative",
          background:
            custom ||
            "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
        }}
      >
        <input
          type="color"
          value={custom || "#ff88cc"}
          onChange={(e) => onChange(e.target.value)}
          style={{
            opacity: 0,
            position: "absolute",
            inset: 0,
            cursor: "pointer",
          }}
        />
      </label>
    </div>
  );
}
