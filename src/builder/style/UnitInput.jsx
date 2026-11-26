// A Figma-style size control: slider + number box + unit switch (px, %, rem, vw…).
// The value is stored as text with its unit, e.g. "24px". Empty means "automatic".
import { parseUnit } from "./text-style.js";

const box = {
  width: 58,
  padding: "3px 4px",
  border: "1px solid #d4d4d8",
  borderRadius: 6,
  fontSize: 12,
};

/**
 * `units`: { px: [min, max, step], "%": [...] } — the first one is the default.
 * `autoLabel`: shown when empty; pass null to always have a value.
 */
export function UnitInput({ value, onChange, units, autoLabel = "Auto" }) {
  const unitNames = Object.keys(units);
  const parsed = parseUnit(value);
  const unit = parsed && units[parsed.unit] ? parsed.unit : unitNames[0];
  const [min, max, step = 1] = units[unit];
  const number = parsed ? parsed.value : null;
  const set = (n, u = unit) => {
    if (n === "" || n == null || Number.isNaN(n))
      return onChange(autoLabel === null ? value : "");
    onChange(`${Math.round(Number(n) * 100) / 100}${u}`);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={number ?? min}
        onChange={(e) => set(e.target.value)}
        style={{ flex: 1, minWidth: 60, opacity: number == null ? 0.4 : 1 }}
      />
      <input
        type="number"
        step={step}
        value={number ?? ""}
        placeholder={autoLabel ?? ""}
        onChange={(e) =>
          set(e.target.value === "" ? "" : Number(e.target.value))
        }
        style={box}
        aria-label="Amount"
      />
      {unitNames.length > 1 ? (
        <select
          value={unit}
          onChange={(e) => {
            const [nMin, nMax] = units[e.target.value];
            const n = number ?? nMin;
            set(Math.min(nMax, Math.max(nMin, n)), e.target.value);
          }}
          style={{ ...box, width: 54 }}
          aria-label="Unit"
        >
          {unitNames.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      ) : (
        <span style={{ fontSize: 12, width: 24 }}>{unit}</span>
      )}
      {number != null && autoLabel !== null && (
        <button
          type="button"
          title={`Back to ${autoLabel.toLowerCase()}`}
          onClick={() => onChange("")}
          style={{ fontSize: 13, padding: "0 4px" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/** Ready-made unit ranges. */
export const units = {
  width: {
    "%": [5, 100, 1],
    px: [40, 1600, 1],
    vw: [5, 100, 1],
    rem: [2, 100, 0.5],
  },
  height: { px: [0, 1600, 1], vh: [0, 100, 1], rem: [0, 100, 0.5] },
  space: {
    px: [0, 200, 1],
    rem: [0, 12, 0.25],
    "%": [0, 30, 1],
    vw: [0, 20, 0.5],
  },
  margin: { px: [-200, 300, 1], rem: [-12, 20, 0.25], vh: [0, 50, 1] },
  radius: { px: [0, 200, 1], "%": [0, 50, 1], rem: [0, 10, 0.25] },
  fontSize: {
    px: [8, 200, 1],
    rem: [0.5, 12, 0.05],
    vw: [0.5, 15, 0.1],
    "%": [50, 400, 5],
  },
  letterSpacing: { em: [-0.1, 0.5, 0.01], px: [-5, 30, 0.5] },
};
