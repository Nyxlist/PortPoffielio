// The Theme maker: a side panel (not a pop-up), so the page stays visible and every change shows live.
import { useEffect, useState } from "react";
import { ThemeLooks } from "./ThemeLooks.jsx";
import { ThemeBasics } from "./ThemeBasics.jsx";
import { ThemeScene } from "./ThemeScene.jsx";
import { ThemeCustomFx } from "./ThemeCustomFx.jsx";
import { ThemeEffects } from "./ThemeEffects.jsx";

const tabs = [
  { id: "looks", label: "Looks" },
  { id: "basics", label: "Colors & fonts" },
  { id: "scene", label: "Scene" },
  { id: "custom", label: "Falling & stickers" },
  { id: "effects", label: "Effects" },
];

export function ThemeDialog({ site, onChange, onClose }) {
  const [tab, setTab] = useState("looks");
  const setTheme = (patch) =>
    onChange((s) => ({
      ...s,
      theme: {
        ...s.theme,
        ...(typeof patch === "function" ? patch(s.theme) : patch),
      },
    }));
  const props = { site, onChange, setTheme, theme: site.theme };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      className="theme-maker bg-base-100 border-base-300 fixed right-0 bottom-0 z-[60] flex w-[min(440px,100vw)] flex-col border-l shadow-2xl"
      aria-label="Theme maker"
    >
      <div className="border-base-300 flex items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-extrabold">Theme maker</h2>
          <p className="text-xs opacity-60">
            Changes show on the page right away and save by themselves.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm"
          aria-label="Close theme maker"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div
        role="tablist"
        className="border-base-300 flex flex-wrap gap-1 border-b px-2 py-2"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            className={`btn btn-sm shrink-0 ${tab === t.id ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {tab === "looks" && <ThemeLooks {...props} />}
        {tab === "basics" && <ThemeBasics {...props} />}
        {tab === "scene" && <ThemeScene {...props} />}
        {tab === "custom" && <ThemeCustomFx {...props} />}
        {tab === "effects" && <ThemeEffects {...props} />}
      </div>
    </aside>
  );
}
