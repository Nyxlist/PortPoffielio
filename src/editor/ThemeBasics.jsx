// Theme maker → Colors & fonts: site name, colors, fonts, corners, page background picture.
import { ImageInput } from "../builder/ImageField.jsx";
import { radiusPresets, themeColors } from "../lib/theme.js";
import { ThemeFonts } from "./ThemeFonts.jsx";
import { Section } from "./theme-ui.jsx";

export function ThemeBasics({ site, onChange, setTheme }) {
  const { theme } = site;
  const setColor = (key, value) =>
    setTheme((t) => ({ colors: { ...t.colors, [key]: value } }));
  const bg = theme.pageBackground ?? {};
  const setBg = (patch) =>
    setTheme((t) => ({ pageBackground: { ...t.pageBackground, ...patch } }));

  return (
    <div className="space-y-8">
      <section className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Site name (shown top left)</span>
          <input
            className="input input-sm w-full"
            value={site.name}
            onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Footer note</span>
          <input
            className="input input-sm w-full"
            value={site.footerNote ?? ""}
            onChange={(e) =>
              onChange((s) => ({ ...s, footerNote: e.target.value }))
            }
          />
        </label>
      </section>

      <Section title="Header" hint="How the top of every page looks.">
        <div className="flex flex-wrap gap-2">
          {[
            ["bar", "Bar (name left, menu right)"],
            ["pills", "Centered logo + pill buttons"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm ${(theme.header ?? "bar") === value ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTheme({ header: value })}
            >
              {label}
            </button>
          ))}
        </div>
        {theme.header === "pills" && (
          <ImageInput
            name="logo"
            label="Logo picture (optional; otherwise the site name is shown)"
            value={theme.logo}
            onChange={(logo) => setTheme({ logo })}
            maxSize={900}
          />
        )}
      </Section>

      <Section
        title="Colors"
        hint="Text on top of the main, second and accent colors turns black or white automatically so it stays readable."
      >
        <div className="grid grid-cols-2 gap-3">
          {themeColors.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="color"
                className="border-base-300 h-9 w-11 shrink-0 cursor-pointer rounded border"
                value={theme.colors[key]}
                onChange={(e) => setColor(key, e.target.value)}
              />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <ThemeFonts theme={theme} setTheme={setTheme} />

      <Section title="Corners">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(radiusPresets).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className={`btn h-auto flex-col py-3 ${theme.radius === key ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTheme({ radius: key })}
            >
              <span
                className="block h-7 w-10 border-2 border-current"
                style={{ borderRadius: preset.box }}
              />
              {preset.label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Page background picture"
        hint="Shown behind every page when no scene sky is set."
      >
        <ImageInput
          name="page-background"
          label="Picture (optional)"
          value={bg.image}
          onChange={(image) => setBg({ image })}
        />
        {bg.image && (
          <>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">
                Soften it so text stays readable: {bg.soften ?? 70}%
              </span>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={bg.soften ?? 70}
                onChange={(e) => setBg({ soften: Number(e.target.value) })}
                className="range range-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!bg.fixed}
                onChange={(e) => setBg({ fixed: e.target.checked })}
              />
              Stay still while scrolling
            </label>
          </>
        )}
      </Section>
    </div>
  );
}
