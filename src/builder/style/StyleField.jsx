// The "Style" settings every block has: placement, colors, background picture, shape,
// size & spacing (with units), effects, text, and animation.
import { ImageInput } from "../ImageField.jsx";
import { ColorChoice, Control, Group, Segmented, Slider } from "./controls.jsx";
import { StylePlacement } from "./StylePlacement.jsx";
import { useSelection } from "../free/free-store.js";
import { StyleText } from "./StyleText.jsx";
import { UnitInput, units } from "./UnitInput.jsx";

const corners = [
  { label: "Square", value: "none" },
  { label: "S", value: "sm", title: "Slightly rounded" },
  { label: "M", value: "md", title: "Rounded" },
  { label: "L", value: "lg", title: "Very rounded" },
  { label: "XL", value: "xl", title: "Extra rounded" },
  { label: "Pill", value: "pill" },
  { label: "Theme", value: "theme", title: "Same as your theme's corners" },
];
const shadows = [
  { label: "None", value: "none" },
  { label: "Soft", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Big", value: "lg" },
  { label: "Glow", value: "glow" },
];

/** `backgroundImage`: show the background-picture controls (for Sections and Cards). */
export function styleField({ backgroundImage = false } = {}) {
  return {
    type: "custom",
    label: "Style",
    render: ({ value, onChange, readOnly }) => (
      <StyleEditor
        value={value ?? {}}
        onChange={onChange}
        readOnly={readOnly}
        backgroundImage={backgroundImage}
      />
    ),
  };
}

function StyleEditor({ value, onChange, readOnly, backgroundImage }) {
  // Always edit the block's live Style. The panel's own copy can be out of date right after
  // the block was dragged or moved on the page, and must never overwrite those changes.
  const live = useSelection();
  const s = (live?.id ? live.style : value) ?? {};
  const set = (key) => (v) => onChange({ ...s, [key]: v });
  if (readOnly) return null;
  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 800 }}>Style</span>
        {Object.keys(s).length > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            style={{ fontSize: 12, textDecoration: "underline" }}
          >
            Reset style
          </button>
        )}
      </div>

      <StylePlacement s={s} onChange={onChange} />

      <Group title="Colors" open>
        <Control title="Background">
          <ColorChoice value={s.bg} onChange={set("bg")} />
        </Control>
        {s.bg && (
          <Control title="Fade into a second color (gradient)">
            <ColorChoice
              value={s.bgTo}
              onChange={set("bgTo")}
              noneLabel="No gradient"
            />
          </Control>
        )}
        {s.bg && s.bgTo && (
          <Control title="Gradient direction">
            <Slider
              min={0}
              max={360}
              step={15}
              value={s.bgAngle ?? 135}
              onChange={set("bgAngle")}
              suffix="°"
            />
          </Control>
        )}
        <Control title="Text color">
          <ColorChoice
            value={s.text}
            onChange={set("text")}
            noneLabel="Automatic"
          />
        </Control>
      </Group>

      {backgroundImage && (
        <Group title="Background picture (backdrop)" open={!!s.bgImage}>
          <ImageInput
            name="bgImage"
            label="Picture behind this area"
            value={s.bgImage}
            onChange={set("bgImage")}
          />
          {s.bgImage && (
            <>
              <Control title="Darken or lighten it so text stays readable">
                <Segmented
                  options={[
                    { label: "Darken", value: false },
                    { label: "Lighten", value: true },
                  ]}
                  value={!!s.bgTintLight}
                  onChange={set("bgTintLight")}
                />
                <Slider
                  min={0}
                  max={90}
                  step={5}
                  value={s.bgTint ?? 30}
                  onChange={set("bgTint")}
                  suffix="%"
                />
              </Control>
              <Control title="Fit">
                <Segmented
                  options={[
                    { label: "Fill", value: "cover" },
                    { label: "Whole picture", value: "contain" },
                    { label: "Repeat", value: "tile" },
                  ]}
                  value={s.bgFit ?? "cover"}
                  onChange={set("bgFit")}
                />
              </Control>
              <Control title="Focus left ↔ right">
                <Slider
                  min={0}
                  max={100}
                  value={s.bgX ?? 50}
                  onChange={set("bgX")}
                  suffix="%"
                />
              </Control>
              <Control title="Focus top ↕ bottom">
                <Slider
                  min={0}
                  max={100}
                  value={s.bgY ?? 50}
                  onChange={set("bgY")}
                  suffix="%"
                />
              </Control>
              <Control title="Stay still while scrolling (parallax)">
                <Segmented
                  options={[
                    { label: "Off", value: false },
                    { label: "On", value: true },
                  ]}
                  value={!!s.bgFixed}
                  onChange={set("bgFixed")}
                />
              </Control>
            </>
          )}
        </Group>
      )}

      <Group title="Shape">
        <Control title="Corners">
          <Segmented
            options={corners}
            value={s.radius ?? "none"}
            onChange={set("radius")}
          />
          <div style={{ height: 6 }} />
          <UnitInput
            value={corners.some((c) => c.value === s.radius) ? "" : s.radius}
            onChange={(v) => set("radius")(v || "none")}
            units={units.radius}
            autoLabel="Preset"
          />
        </Control>
        <Control title="Border">
          <Slider
            min={0}
            max={16}
            value={s.borderWidth ?? 0}
            onChange={set("borderWidth")}
            suffix="px"
          />
        </Control>
        {s.borderWidth > 0 && (
          <>
            <Control title="Border style">
              <Segmented
                options={[
                  { label: "Solid", value: "solid" },
                  { label: "Dashed", value: "dashed" },
                  { label: "Dotted", value: "dotted" },
                ]}
                value={s.borderStyle ?? "solid"}
                onChange={set("borderStyle")}
              />
            </Control>
            <Control title="Border color">
              <ColorChoice
                value={s.borderColor}
                onChange={set("borderColor")}
                noneLabel="Theme border"
              />
            </Control>
          </>
        )}
        <Control title="Shadow">
          <Segmented
            options={shadows}
            value={s.shadow ?? "none"}
            onChange={set("shadow")}
          />
        </Control>
      </Group>

      <Group title="Size & spacing">
        <Control title="Width">
          <UnitInput
            value={
              typeof s.width === "number"
                ? s.width < 100
                  ? `${s.width}%`
                  : ""
                : s.width
            }
            onChange={set("width")}
            units={units.width}
            autoLabel="Full"
          />
        </Control>
        {s.width && s.width !== 100 && (
          <Control title="Position">
            <Segmented
              options={[
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ]}
              value={s.align ?? "center"}
              onChange={set("align")}
            />
          </Control>
        )}
        <Control title="Height (at least)">
          <UnitInput
            value={s.height}
            onChange={set("height")}
            units={units.height}
          />
        </Control>
        <Control title="Space inside (all sides)">
          <UnitInput
            value={
              { sm: "12px", md: "24px", lg: "40px", xl: "64px" }[s.padding] ??
              (s.padding === "none" ? "" : s.padding)
            }
            onChange={set("padding")}
            units={units.space}
            autoLabel="None"
          />
        </Control>
        <Control title="Space inside: left & right only">
          <UnitInput
            value={s.padX}
            onChange={set("padX")}
            units={units.space}
            autoLabel="Same"
          />
        </Control>
        <Control title="Space inside: top & bottom only">
          <UnitInput
            value={s.padY}
            onChange={set("padY")}
            units={units.space}
            autoLabel="Same"
          />
        </Control>
        <Control title="Extra space above">
          <UnitInput
            value={s.marginTop}
            onChange={set("marginTop")}
            units={units.margin}
            autoLabel="None"
          />
        </Control>
        <Control title="Extra space below">
          <UnitInput
            value={s.marginBottom}
            onChange={set("marginBottom")}
            units={units.margin}
            autoLabel="None"
          />
        </Control>
      </Group>

      <Group title="Effects">
        <Control title="See-through">
          <Slider
            min={10}
            max={100}
            step={5}
            value={s.opacity ?? 100}
            onChange={set("opacity")}
            suffix="%"
          />
        </Control>
        <Control title="Tilt">
          <Slider
            min={-10}
            max={10}
            value={s.rotate ?? 0}
            onChange={set("rotate")}
            suffix="°"
          />
        </Control>
      </Group>

      <StyleText s={s} onChange={onChange} />
    </div>
  );
}
