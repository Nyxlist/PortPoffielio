// Theme maker → Looks: ready-made themes, and "My themes" she saves herself.
import { useState } from "react";
import { fonts } from "../lib/theme.js";
import { scenePresets, themePresets } from "../lib/theme-presets.js";
import { moods } from "../site/scene/moods.js";
import { Section } from "./theme-ui.jsx";

/** The parts of the theme a saved look remembers (fonts she uploaded stay shared). */
const LOOK_KEYS = [
  "colors",
  "font",
  "headingFont",
  "radius",
  "scene",
  "effects",
  "pageBackground",
  "header",
];
const snapshot = (theme) =>
  structuredClone(
    Object.fromEntries(LOOK_KEYS.map((k) => [k, theme[k] ?? null])),
  );

function PresetCard({ look, onPick, children }) {
  const c = look.colors;
  const sky = moods[look.scene?.sky]?.sky;
  return (
    <div className="rounded-box border-base-300 hover:border-primary overflow-hidden border transition">
      <button
        type="button"
        onClick={onPick}
        className="block w-full text-left"
        style={{ background: c["base-100"], color: c["base-content"] }}
      >
        {sky ? (
          <div
            className="flex h-10 items-end gap-1 px-2 pb-1"
            style={{ background: sky }}
          >
            {["primary", "secondary", "accent"].map((k) => (
              <span
                key={k}
                className="h-3 w-3 rounded-full"
                style={{ background: c[k] }}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-10">
            {["primary", "secondary", "accent", "base-200"].map((k) => (
              <span key={k} className="flex-1" style={{ background: c[k] }} />
            ))}
          </div>
        )}
        <div
          className="truncate px-3 py-2 text-sm font-bold"
          style={{ fontFamily: fonts[look.headingFont] }}
        >
          {look.name}
        </div>
      </button>
      {children}
    </div>
  );
}

export function ThemeLooks({ site, onChange, setTheme }) {
  const { theme } = site;
  const saved = site.savedThemes ?? [];
  const [previous, setPrevious] = useState(null);
  const [newName, setNewName] = useState("");
  const setSaved = (next) =>
    onChange((s) => ({
      ...s,
      savedThemes:
        typeof next === "function" ? next(s.savedThemes ?? []) : next,
    }));

  /**
   * Saved looks come back exactly as saved. Ready-made themes only change what they define,
   * and keep her own falling things, stickers, and click/scroll effects.
   */
  function apply(look, { exact = false } = {}) {
    setPrevious(snapshot(theme));
    const patch = Object.fromEntries(
      LOOK_KEYS.filter((k) => exact || k in look).map((k) => [
        k,
        look[k] ?? null,
      ]),
    );
    if (!exact && "scene" in look) {
      const own = {
        custom: theme.scene?.custom ?? [],
        stickers: theme.scene?.stickers ?? [],
      };
      patch.scene = look.scene
        ? { ...look.scene, ...own }
        : own.custom.length || own.stickers.length
          ? own
          : null;
    }
    setTheme(structuredClone(patch));
  }

  function saveAsNew(event) {
    event.preventDefault();
    const name = newName.trim() || `My theme ${saved.length + 1}`;
    setSaved((list) => [
      ...list,
      { id: crypto.randomUUID(), name, ...snapshot(theme) },
    ]);
    setNewName("");
  }

  const update = (look) => {
    if (confirm(`Replace "${look.name}" with the current look?`))
      setSaved((list) =>
        list.map((l) => (l.id === look.id ? { ...l, ...snapshot(theme) } : l)),
      );
  };
  const rename = (look) => {
    const name = prompt("New name for this theme:", look.name)?.trim();
    if (name)
      setSaved((list) =>
        list.map((l) => (l.id === look.id ? { ...l, name } : l)),
      );
  };
  const remove = (look) => {
    if (
      confirm(
        `Delete your theme "${look.name}"? The current look stays as it is.`,
      )
    )
      setSaved((list) => list.filter((l) => l.id !== look.id));
  };

  return (
    <div className="space-y-8">
      {previous && (
        <button
          type="button"
          className="btn btn-outline btn-sm w-full"
          onClick={() => {
            setTheme(previous);
            setPrevious(null);
          }}
        >
          ↶ Undo the last theme I picked
        </button>
      )}

      <Section
        title="My themes"
        hint="Save the current look (colors, fonts, scene, falling things, stickers, effects) to come back to it any time."
      >
        <form onSubmit={saveAsNew} className="flex gap-2">
          <input
            className="input input-sm flex-1"
            placeholder="Name, e.g. Birthday stream"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={40}
          />
          <button className="btn btn-primary btn-sm">Save current look</button>
        </form>
        {saved.length === 0 ? (
          <p className="text-sm opacity-60">No saved themes yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {saved.map((look) => (
              <PresetCard
                key={look.id}
                look={look}
                onPick={() => apply(look, { exact: true })}
              >
                <div className="border-base-300 bg-base-100 flex justify-between gap-1 border-t px-1 py-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    title="Replace with the current look"
                    onClick={() => update(look)}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => rename(look)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => remove(look)}
                  >
                    Delete
                  </button>
                </div>
              </PresetCard>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Scenes (whole page)"
        hint="Click one to try it. Everything can be changed in the other tabs."
      >
        <div className="grid grid-cols-2 gap-3">
          {scenePresets.map((p) => (
            <PresetCard key={p.name} look={p} onPick={() => apply(p)} />
          ))}
        </div>
      </Section>

      <Section title="Plain colors">
        <div className="grid grid-cols-2 gap-3">
          {themePresets.map((p) => (
            <PresetCard
              key={p.name}
              look={{ ...p, scene: null }}
              onPick={() => apply({ ...p, scene: null, pageBackground: null })}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
