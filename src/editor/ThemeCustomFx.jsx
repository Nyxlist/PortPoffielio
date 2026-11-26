// Theme maker → Falling & stickers: her own falling/floating things (any emoji, text, or picture)
// and stickers (her own pictures) pinned anywhere on the page.
import { ImageInput } from "../builder/ImageField.jsx";
import {
  Choice,
  Label,
  Section,
  amountOptions,
  speedOptions,
} from "./theme-ui.jsx";

const quickEmoji = [
  "🌸",
  "⭐",
  "💖",
  "🍓",
  "✨",
  "🎀",
  "🫧",
  "🍀",
  "🐾",
  "🎵",
  "🌙",
  "❄️",
];

const motionOptions = [
  { value: "fall", label: "Fall" },
  { value: "rise", label: "Rise" },
  { value: "float", label: "Float around" },
  { value: "twinkle", label: "Twinkle in place" },
];
const sizeOptions = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
];
const positionOptions = [
  { value: "top-left", label: "↖" },
  { value: "top", label: "↑" },
  { value: "top-right", label: "↗" },
  { value: "left", label: "←" },
  { value: "right", label: "→" },
  { value: "bottom-left", label: "↙" },
  { value: "bottom", label: "↓" },
  { value: "bottom-right", label: "↘" },
];

const newThing = () => ({
  id: crypto.randomUUID(),
  kind: "emoji",
  value: "🌸",
  motion: "fall",
  amount: "some",
  speed: "normal",
  size: "m",
  spin: true,
});
const newSticker = () => ({
  id: crypto.randomUUID(),
  image: "",
  position: "bottom-right",
  size: 22,
  opacity: 100,
  float: true,
  flip: false,
});

function ItemCard({ title, onRemove, children }) {
  return (
    <div className="rounded-box border-base-300 space-y-3 border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{title}</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs text-error"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function ThemeCustomFx({ theme, setTheme }) {
  const scene = theme.scene ?? {};
  const custom = scene.custom ?? [];
  const stickers = scene.stickers ?? [];
  const setScene = (patch) =>
    setTheme((t) => ({ scene: { ...t.scene, ...patch(t.scene ?? {}) } }));
  const updateThing = (id, patch) =>
    setScene((sc) => ({
      custom: (sc.custom ?? []).map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }));
  const updateSticker = (id, patch) =>
    setScene((sc) => ({
      stickers: (sc.stickers ?? []).map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }));

  return (
    <div className="space-y-8">
      <Section
        title="My falling & floating things"
        hint="Any emoji, a short text, or your own picture. Add as many as you like."
      >
        {custom.map((item, i) => (
          <ItemCard
            key={item.id}
            title={`#${i + 1}`}
            onRemove={() =>
              setScene((sc) => ({
                custom: (sc.custom ?? []).filter((c) => c.id !== item.id),
              }))
            }
          >
            <Choice
              options={[
                { value: "emoji", label: "Emoji or text" },
                { value: "image", label: "My picture" },
              ]}
              value={item.kind}
              onPick={(kind) =>
                updateThing(item.id, {
                  kind,
                  value: kind === "emoji" ? "🌸" : "",
                })
              }
            />
            {item.kind === "image" ? (
              <ImageInput
                name={`thing-${item.id}`}
                label="Picture (see-through PNGs look best)"
                value={item.value}
                onChange={(value) => updateThing(item.id, { value })}
                maxSize={192}
              />
            ) : (
              <div className="space-y-2">
                <input
                  className="input input-sm w-full text-lg"
                  maxLength={12}
                  value={item.value}
                  onChange={(e) =>
                    updateThing(item.id, { value: e.target.value })
                  }
                  aria-label="Emoji or text"
                />
                <div className="flex flex-wrap gap-1">
                  {quickEmoji.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className="btn btn-ghost btn-sm px-2 text-lg"
                      onClick={() => updateThing(item.id, { value: e })}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Label title="Movement">
              <Choice
                options={motionOptions}
                value={item.motion}
                onPick={(motion) => updateThing(item.id, { motion })}
              />
            </Label>
            <Label title="How many">
              <Choice
                options={amountOptions}
                value={item.amount}
                onPick={(amount) => updateThing(item.id, { amount })}
              />
            </Label>
            <Label title="Speed">
              <Choice
                options={speedOptions}
                value={item.speed}
                onPick={(speed) => updateThing(item.id, { speed })}
              />
            </Label>
            <Label title="Size">
              <Choice
                options={sizeOptions}
                value={item.size}
                onPick={(size) => updateThing(item.id, { size })}
              />
            </Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={item.spin !== false}
                onChange={(e) =>
                  updateThing(item.id, { spin: e.target.checked })
                }
              />
              Spin while moving
            </label>
          </ItemCard>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            setScene((sc) => ({ custom: [...(sc.custom ?? []), newThing()] }))
          }
        >
          + Add a falling / floating thing
        </button>
      </Section>

      <Section
        title="Stickers"
        hint="Your own pictures pinned on the page (behind the content), like a mascot peeking from a corner."
      >
        {stickers.map((sticker, i) => (
          <ItemCard
            key={sticker.id}
            title={`Sticker ${i + 1}`}
            onRemove={() =>
              setScene((sc) => ({
                stickers: (sc.stickers ?? []).filter(
                  (c) => c.id !== sticker.id,
                ),
              }))
            }
          >
            <ImageInput
              name={`sticker-${sticker.id}`}
              label="Picture"
              value={sticker.image}
              onChange={(image) => updateSticker(sticker.id, { image })}
              maxSize={900}
            />
            <Label title="Where">
              <div className="grid w-36 grid-cols-3 gap-1">
                {positionOptions.slice(0, 3).map((o) => (
                  <PositionButton
                    key={o.value}
                    option={o}
                    sticker={sticker}
                    onPick={updateSticker}
                  />
                ))}
                <PositionButton
                  option={positionOptions[3]}
                  sticker={sticker}
                  onPick={updateSticker}
                />
                <span />
                <PositionButton
                  option={positionOptions[4]}
                  sticker={sticker}
                  onPick={updateSticker}
                />
                {positionOptions.slice(5).map((o) => (
                  <PositionButton
                    key={o.value}
                    option={o}
                    sticker={sticker}
                    onPick={updateSticker}
                  />
                ))}
              </div>
            </Label>
            <Label title={`Size: ${sticker.size}% of the window height`}>
              <input
                type="range"
                className="range range-sm"
                min={5}
                max={60}
                value={sticker.size}
                onChange={(e) =>
                  updateSticker(sticker.id, { size: Number(e.target.value) })
                }
              />
            </Label>
            <Label title={`See-through: ${sticker.opacity}%`}>
              <input
                type="range"
                className="range range-sm"
                min={10}
                max={100}
                step={5}
                value={sticker.opacity}
                onChange={(e) =>
                  updateSticker(sticker.id, { opacity: Number(e.target.value) })
                }
              />
            </Label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={!!sticker.float}
                  onChange={(e) =>
                    updateSticker(sticker.id, { float: e.target.checked })
                  }
                />
                Gently bob up and down
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={!!sticker.flip}
                  onChange={(e) =>
                    updateSticker(sticker.id, { flip: e.target.checked })
                  }
                />
                Mirror
              </label>
            </div>
          </ItemCard>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            setScene((sc) => ({
              stickers: [...(sc.stickers ?? []), newSticker()],
            }))
          }
        >
          + Add a sticker
        </button>
      </Section>
    </div>
  );
}

function PositionButton({ option, sticker, onPick }) {
  const active = sticker.position === option.value;
  return (
    <button
      type="button"
      className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
      aria-pressed={active}
      title={option.value}
      onClick={() => onPick(sticker.id, { position: option.value })}
    >
      {option.label}
    </button>
  );
}
