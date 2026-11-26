// Combining pictures in the Image block:
// - Mask: show the picture only inside the shape of another picture (e.g. a brush stroke,
//   a silhouette, cat ears). See-through parts of the mask PNG hide the picture.
// - Blend: lay a second picture on top and mix them (multiply, screen, overlay…).
import { ImageInput } from "../ImageField.jsx";
import { Control, Segmented, Slider } from "../style/controls.jsx";
import { safeImageUrl } from "../../lib/safe-url.js";

export const defaultMask = {
  src: "",
  mode: "alpha",
  fit: "contain",
  size: 100,
  x: 50,
  y: 50,
  invert: false,
};
export const defaultBlend = {
  src: "",
  mode: "overlay",
  opacity: 60,
  fit: "cover",
};

export const blendModes = [
  { label: "Overlay", value: "overlay" },
  { label: "Multiply", value: "multiply" },
  { label: "Screen", value: "screen" },
  { label: "Soft light", value: "soft-light" },
  { label: "Color", value: "color" },
  { label: "Lighten", value: "lighten" },
  { label: "Darken", value: "darken" },
  { label: "Difference", value: "difference" },
  { label: "Normal", value: "normal" },
];
const knownModes = new Set(blendModes.map((m) => m.value));

const title = {
  fontSize: 14,
  fontWeight: 700,
  display: "block",
  marginBottom: 8,
};

export const maskField = {
  type: "custom",
  label: "Mask with a picture",
  render: ({ value, onChange }) => {
    const m = { ...defaultMask, ...value };
    const set = (key) => (v) => onChange({ ...m, [key]: v });
    return (
      <div>
        <span style={title}>Mask with a picture</span>
        <ImageInput
          name="mask"
          label="Shape picture (see-through PNG, or black & white)"
          value={m.src}
          onChange={set("src")}
          maxSize={1200}
        />
        {m.src && (
          <div style={{ marginTop: 12 }}>
            <Control title="Use the mask's">
              <Segmented
                options={[
                  { label: "See-through parts", value: "alpha" },
                  { label: "Light & dark", value: "luminance" },
                ]}
                value={m.mode}
                onChange={set("mode")}
              />
            </Control>
            <Control title="Fit">
              <Segmented
                options={[
                  { label: "Whole shape", value: "contain" },
                  { label: "Fill", value: "cover" },
                  { label: "Stretch", value: "stretch" },
                  { label: "Repeat", value: "repeat" },
                ]}
                value={m.fit}
                onChange={set("fit")}
              />
            </Control>
            <Control title="Mask size">
              <Slider
                min={10}
                max={300}
                step={5}
                value={m.size}
                onChange={set("size")}
                suffix="%"
              />
            </Control>
            <Control title="Mask left ↔ right">
              <Slider
                min={0}
                max={100}
                value={m.x}
                onChange={set("x")}
                suffix="%"
              />
            </Control>
            <Control title="Mask top ↕ bottom">
              <Slider
                min={0}
                max={100}
                value={m.y}
                onChange={set("y")}
                suffix="%"
              />
            </Control>
            {m.mode === "luminance" && (
              <label style={{ display: "flex", gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={m.invert}
                  onChange={(e) => set("invert")(e.target.checked)}
                />
                Swap (show the dark parts instead)
              </label>
            )}
          </div>
        )}
      </div>
    );
  },
};

export const blendField = {
  type: "custom",
  label: "Blend with another picture",
  render: ({ value, onChange }) => {
    const b = { ...defaultBlend, ...value };
    const set = (key) => (v) => onChange({ ...b, [key]: v });
    return (
      <div>
        <span style={title}>Blend with another picture</span>
        <ImageInput
          name="blend"
          label="Picture laid on top"
          value={b.src}
          onChange={set("src")}
          maxSize={1600}
        />
        {b.src && (
          <div style={{ marginTop: 12 }}>
            <Control title="Mix">
              <Segmented
                options={blendModes}
                value={b.mode}
                onChange={set("mode")}
              />
            </Control>
            <Control title="Strength">
              <Slider
                min={5}
                max={100}
                step={5}
                value={b.opacity}
                onChange={set("opacity")}
                suffix="%"
              />
            </Control>
            <Control title="Fit">
              <Segmented
                options={[
                  { label: "Fill", value: "cover" },
                  { label: "Whole picture", value: "contain" },
                ]}
                value={b.fit}
                onChange={set("fit")}
              />
            </Control>
          </div>
        )}
      </div>
    );
  },
};

const quoteUrl = (url) => `url("${url.replaceAll('"', "%22")}")`;

/** CSS for the picture mask, or {} when there is none. Replaces the shape's own mask. */
export function maskCss(mask) {
  const m = { ...defaultMask, ...mask };
  const src = safeImageUrl(m.src);
  if (!src) return {};
  const size =
    m.fit === "stretch"
      ? "100% 100%"
      : m.fit === "repeat"
        ? `${m.size}%`
        : m.size === 100
          ? m.fit
          : `${m.size}%`;
  const css = {
    maskImage: quoteUrl(src),
    maskMode: m.mode === "luminance" ? "luminance" : "alpha",
    maskSize: size,
    maskRepeat: m.fit === "repeat" ? "repeat" : "no-repeat",
    maskPosition: `${m.x}% ${m.y}%`,
  };
  // Swapping light & dark: draw the mask once more and subtract (keeps the dark parts).
  if (m.mode === "luminance" && m.invert) {
    css.maskImage = `linear-gradient(#fff, #fff), ${quoteUrl(src)}`;
    css.maskComposite = "exclude";
    css.maskSize = `100% 100%, ${size}`;
    css.maskPosition = `0 0, ${m.x}% ${m.y}%`;
    css.maskRepeat = `no-repeat, ${css.maskRepeat}`;
  }
  return css;
}

/** The second picture laid on top of the first, mixed in with the chosen blend mode. */
export function BlendLayer({ blend }) {
  const b = { ...defaultBlend, ...blend };
  const src = safeImageUrl(b.src);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: b.fit === "contain" ? "contain" : "cover",
        mixBlendMode: knownModes.has(b.mode) ? b.mode : "normal",
        opacity: Math.max(5, Math.min(100, b.opacity)) / 100,
        pointerEvents: "none",
      }}
    />
  );
}
