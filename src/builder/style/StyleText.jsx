// "Text" and "Animation" in a block's Style: Figma-like sliders with units, text filled with a
// picture or gradient, outline and shadow, and animations with when they play.
import { ImageInput } from "../ImageField.jsx";
import { fonts } from "../../lib/theme.js";
import { ColorChoice, Control, Group, Segmented, Slider } from "./controls.jsx";
import { useSite } from "./site-context.js";
import { UnitInput, units } from "./UnitInput.jsx";
import { animationTriggers, animations } from "./text-style.js";

const select = {
  width: "100%",
  padding: "5px 6px",
  border: "1px solid #d4d4d8",
  borderRadius: 6,
  fontSize: 13,
};

function FontPicker({ value, onChange }) {
  const site = useSite();
  const custom = site?.theme?.customFonts ?? [];
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={select}
    >
      <option value="">Same as the rest of the block</option>
      <option value="heading">Theme heading font</option>
      <option value="body">Theme text font</option>
      {Object.keys(fonts).map((name) => (
        <option key={name} value={name} style={{ fontFamily: fonts[name] }}>
          {name}
        </option>
      ))}
      {custom.map((f) => (
        <option key={f.id} value={`custom:${f.id}`}>
          {f.name} (my font)
        </option>
      ))}
    </select>
  );
}

export function StyleText({ s, onChange }) {
  const set = (key) => (v) => onChange({ ...s, [key]: v });
  const fill = s.textFill ?? {};
  const setFill = (patch) =>
    onChange({ ...s, textFill: { ...fill, ...patch } });
  const anim = s.anim ?? {};
  const setAnim = (patch) => onChange({ ...s, anim: { ...anim, ...patch } });

  return (
    <>
      <Group title="Text">
        <Control title="Font">
          <FontPicker value={s.font} onChange={set("font")} />
        </Control>
        <Control title="Size">
          <UnitInput
            value={s.fontSize}
            onChange={set("fontSize")}
            units={units.fontSize}
          />
        </Control>
        <Control title={`Weight: ${s.fontWeight ?? "auto"}`}>
          <Slider
            min={100}
            max={900}
            step={100}
            value={s.fontWeight ?? 400}
            onChange={set("fontWeight")}
          />
        </Control>
        <Control title="Letter spacing">
          <UnitInput
            value={s.letterSpacing}
            onChange={set("letterSpacing")}
            units={units.letterSpacing}
          />
        </Control>
        <Control
          title={`Line height: ${s.lineHeight ? `${s.lineHeight}%` : "auto"}`}
        >
          <Slider
            min={70}
            max={250}
            step={5}
            value={s.lineHeight ?? 140}
            onChange={set("lineHeight")}
            suffix="%"
          />
        </Control>
        <Control title="Align">
          <Segmented
            options={[
              { label: "Auto", value: "" },
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Justify", value: "justify" },
            ]}
            value={s.textAlign ?? ""}
            onChange={set("textAlign")}
          />
        </Control>
        <Control title="Style">
          <Segmented
            options={[
              { label: "Aa", value: "none", title: "As typed" },
              { label: "AA", value: "uppercase", title: "UPPERCASE" },
              { label: "aa", value: "lowercase", title: "lowercase" },
              {
                label: "Aa Bb",
                value: "capitalize",
                title: "Capitalize Each Word",
              },
            ]}
            value={s.textCase ?? "none"}
            onChange={set("textCase")}
          />
          <label
            style={{ display: "flex", gap: 6, fontSize: 13, marginTop: 6 }}
          >
            <input
              type="checkbox"
              checked={!!s.italic}
              onChange={(e) => set("italic")(e.target.checked)}
            />
            Italic
          </label>
        </Control>
        <Control title="Outline around the letters">
          <Slider
            min={0}
            max={8}
            step={0.5}
            value={s.strokeWidth ?? 0}
            onChange={set("strokeWidth")}
            suffix="px"
          />
          {s.strokeWidth > 0 && (
            <ColorChoice
              value={s.strokeColor}
              onChange={set("strokeColor")}
              noneLabel="Text color"
            />
          )}
        </Control>
        <Control title="Shadow">
          <Segmented
            options={[
              { label: "None", value: "none" },
              { label: "Soft", value: "soft" },
              { label: "Hard", value: "hard" },
              { label: "Glow", value: "glow" },
              { label: "Pop", value: "pop" },
            ]}
            value={s.textShadow ?? "none"}
            onChange={set("textShadow")}
          />
          {s.textShadow &&
            s.textShadow !== "none" &&
            s.textShadow !== "soft" && (
              <ColorChoice
                value={s.shadowColor}
                onChange={set("shadowColor")}
                noneLabel="Automatic"
              />
            )}
        </Control>
      </Group>

      <Group
        title="Text fill (picture or gradient inside the letters)"
        open={!!fill.type}
      >
        <Segmented
          options={[
            { label: "Plain color", value: "" },
            { label: "Gradient", value: "gradient" },
            { label: "Picture", value: "image" },
          ]}
          value={fill.type ?? ""}
          onChange={(type) => setFill({ type })}
        />
        <div style={{ height: 10 }} />
        {fill.type === "gradient" && (
          <>
            <Control title="From">
              <ColorChoice
                value={fill.from}
                onChange={(from) => setFill({ from })}
                noneLabel="Main color"
              />
            </Control>
            <Control title="To">
              <ColorChoice
                value={fill.to}
                onChange={(to) => setFill({ to })}
                noneLabel="Second color"
              />
            </Control>
            <Control title="Direction">
              <Slider
                min={0}
                max={360}
                step={15}
                value={fill.angle ?? 90}
                onChange={(angle) => setFill({ angle })}
                suffix="°"
              />
            </Control>
          </>
        )}
        {fill.type === "image" && (
          <>
            <ImageInput
              name="text-fill"
              label="Picture shown through the letters"
              value={fill.image}
              onChange={(image) => setFill({ image })}
              maxSize={1200}
            />
            <Control
              title={`Picture size: ${fill.size ? `${fill.size}%` : "fill"}`}
            >
              <Slider
                min={0}
                max={400}
                step={10}
                value={fill.size ?? 0}
                onChange={(size) => setFill({ size })}
                suffix="%"
              />
            </Control>
            <Control title="Picture left ↔ right">
              <Slider
                min={0}
                max={100}
                value={fill.x ?? 50}
                onChange={(x) => setFill({ x })}
                suffix="%"
              />
            </Control>
            <Control title="Picture top ↕ bottom">
              <Slider
                min={0}
                max={100}
                value={fill.y ?? 50}
                onChange={(y) => setFill({ y })}
                suffix="%"
              />
            </Control>
            <p style={{ fontSize: 12, opacity: 0.7 }}>
              Tip: thick, bold fonts show the picture best.
            </p>
          </>
        )}
      </Group>

      <Group title="Animation" open={!!anim.type && anim.type !== "none"}>
        <Control title="Effect">
          <Segmented
            options={animations}
            value={anim.type ?? "none"}
            onChange={(type) => setAnim({ type })}
          />
        </Control>
        {anim.type && anim.type !== "none" && (
          <>
            <Control title="When it plays">
              <Segmented
                options={animationTriggers}
                value={anim.trigger ?? "view"}
                onChange={(trigger) => setAnim({ trigger })}
              />
            </Control>
            <Control title="How long">
              <Slider
                min={0.2}
                max={6}
                step={0.1}
                value={anim.speed ?? 1}
                onChange={(speed) => setAnim({ speed })}
                suffix="s"
              />
            </Control>
            <Control title="Wait before starting">
              <Slider
                min={0}
                max={5}
                step={0.1}
                value={anim.delay ?? 0}
                onChange={(delay) => setAnim({ delay })}
                suffix="s"
              />
            </Control>
          </>
        )}
      </Group>
    </>
  );
}
