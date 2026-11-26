// Theme maker → Effects: what happens when visitors click, and as they scroll.
import { useRef } from "react";
import { ImageInput } from "../builder/ImageField.jsx";
import { themeToCssVars } from "../lib/theme.js";
import {
  clickEffectOptions,
  playBurst,
} from "../site/effects/ClickEffects.jsx";
import { revealOptions } from "../site/effects/ScrollEffects.jsx";
import { Choice, Label, Section, amountOptions } from "./theme-ui.jsx";

const sizeOptions = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
];

export function ThemeEffects({ theme, setTheme }) {
  const effects = theme.effects ?? {};
  const click = effects.click ?? { type: "none" };
  const scroll = effects.scroll ?? {};
  const setClick = (patch) =>
    setTheme((t) => ({
      effects: {
        ...t.effects,
        click: { ...(t.effects?.click ?? {}), ...patch },
      },
    }));
  const setScroll = (patch) =>
    setTheme((t) => ({
      effects: {
        ...t.effects,
        scroll: { ...(t.effects?.scroll ?? {}), ...patch },
      },
    }));
  const custom = click.custom ?? { kind: "emoji", value: "💖" };
  const tryLayer = useRef(null);

  return (
    <div className="space-y-8">
      <Section
        title="When visitors click"
        hint="A little burst appears wherever someone clicks on your site."
      >
        <Choice
          options={clickEffectOptions}
          value={click.type ?? "none"}
          onPick={(type) => setClick({ type })}
        />
        {click.type === "custom" && (
          <div className="rounded-box border-base-300 space-y-3 border p-3">
            <Choice
              options={[
                { value: "emoji", label: "Emoji or text" },
                { value: "image", label: "My picture" },
              ]}
              value={custom.kind}
              onPick={(kind) =>
                setClick({
                  custom: { kind, value: kind === "emoji" ? "💖" : "" },
                })
              }
            />
            {custom.kind === "image" ? (
              <ImageInput
                name="click-picture"
                label="Picture"
                value={custom.value}
                onChange={(value) => setClick({ custom: { ...custom, value } })}
                maxSize={128}
              />
            ) : (
              <input
                className="input input-sm w-full text-lg"
                maxLength={12}
                value={custom.value}
                onChange={(e) =>
                  setClick({ custom: { ...custom, value: e.target.value } })
                }
                aria-label="Emoji or text"
              />
            )}
          </div>
        )}
        {click.type && click.type !== "none" && click.type !== "ripple" && (
          <div className="flex flex-wrap gap-6">
            <Label title="How many">
              <Choice
                options={amountOptions}
                value={click.amount ?? "some"}
                onPick={(amount) => setClick({ amount })}
              />
            </Label>
            <Label title="Size">
              <Choice
                options={sizeOptions}
                value={click.size ?? "m"}
                onPick={(size) => setClick({ size })}
              />
            </Label>
          </div>
        )}
        {click.type && click.type !== "none" && (
          <button
            type="button"
            className="rounded-box border-base-300 flex h-24 w-full items-center justify-center border-2 border-dashed text-sm opacity-80"
            style={themeToCssVars(theme)}
            onClick={(e) =>
              playBurst(tryLayer.current, click, e.clientX, e.clientY)
            }
          >
            Click here to try it
            <span ref={tryLayer} className="fx-layer" aria-hidden="true" />
          </button>
        )}
      </Section>

      <Section title="When visitors scroll">
        <Label title="Sections appear with">
          <Choice
            options={revealOptions}
            value={scroll.reveal ?? "none"}
            onPick={(reveal) => setScroll({ reveal })}
          />
        </Label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!!scroll.progressBar}
            onChange={(e) => setScroll({ progressBar: e.target.checked })}
          />
          Progress bar along the top (shows how far down the page you are)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!!scroll.parallax}
            onChange={(e) => setScroll({ parallax: e.target.checked })}
          />
          Parallax: sun, moon, clouds and rainbow drift slowly as you scroll
        </label>
      </Section>

      <p className="rounded-box bg-base-200 p-3 text-sm">
        Click and scroll effects are switched off while you edit, so they don't
        get in the way. Use <b>Preview ↗</b> to try them on the real page.
        Visitors who turned on "reduce motion" on their device won't see them.
      </p>
    </div>
  );
}
