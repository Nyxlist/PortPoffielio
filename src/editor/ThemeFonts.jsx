// Theme panel → Fonts: pick heading and text fonts, upload her own.
import { useState } from "react";
import { customFontCss, fontFamily, fonts } from "../lib/theme.js";
import { fontFileToCustomFont } from "../lib/font-upload.js";

function FontPicker({ title, value, theme, onPick }) {
  const choices = [
    ...Object.keys(fonts).map((name) => ({ value: name, label: name })),
    ...(theme.customFonts ?? []).map((f) => ({
      value: `custom:${f.id}`,
      label: f.name,
    })),
  ];
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {choices.map((c) => (
          <button
            key={c.value}
            type="button"
            className={`btn h-auto justify-start py-2 text-base normal-case ${value === c.value ? "btn-primary" : "btn-outline"}`}
            style={{ fontFamily: fontFamily(c.value, theme) }}
            onClick={() => onPick(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThemeFonts({ theme, setTheme }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const font = await fontFileToCustomFont(file);
      setTheme((t) => ({ customFonts: [...(t.customFonts ?? []), font] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function remove(font) {
    if (
      !confirm(
        `Remove the font "${font.name}"? Text using it goes back to Nunito.`,
      )
    )
      return;
    const key = `custom:${font.id}`;
    setTheme((t) => ({
      customFonts: t.customFonts.filter((f) => f.id !== font.id),
      font: t.font === key ? "Nunito" : t.font,
      headingFont: t.headingFont === key ? "Nunito" : t.headingFont,
    }));
  }

  return (
    <section className="space-y-4">
      {/* Lets the buttons below preview her uploaded fonts. */}
      <style>{customFontCss(theme)}</style>
      <h3 className="font-bold">Fonts</h3>
      <FontPicker
        title="Headings"
        value={theme.headingFont ?? theme.font}
        theme={theme}
        onPick={(v) => setTheme({ headingFont: v })}
      />
      <FontPicker
        title="Text"
        value={theme.font}
        theme={theme}
        onPick={(v) => setTheme({ font: v })}
      />

      <div className="rounded-box border-base-300 space-y-2 border p-3">
        <h4 className="text-sm font-semibold">Your own fonts</h4>
        {(theme.customFonts ?? []).map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span
              style={{ fontFamily: fontFamily(`custom:${f.id}`, theme) }}
              className="text-lg"
            >
              {f.name}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-error"
              onClick={() => remove(f)}
            >
              Remove
            </button>
          </div>
        ))}
        <label className="block text-sm">
          <span className="mb-1 block opacity-70">
            {busy
              ? "Adding…"
              : "Upload a font file (.woff2, .woff, .ttf, .otf). Make sure you're allowed to use it on a website."}
          </span>
          <input
            type="file"
            accept=".woff2,.woff,.ttf,.otf"
            className="file-input file-input-sm w-full"
            onChange={upload}
            disabled={busy}
          />
        </label>
        {error && <p className="text-error text-sm">{error}</p>}
      </div>
    </section>
  );
}
