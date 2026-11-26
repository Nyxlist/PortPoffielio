// Theme panel → Scene: sky, scenery, and falling/floating bits behind the whole page.
import {
  decorOptions,
  moodOptions,
  moods,
  particleList,
  particleOptions,
} from "../site/scene/moods.js";

const chip = (active) => `btn btn-sm ${active ? "btn-primary" : "btn-outline"}`;

function Choice({ options, value, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={chip(o.value === value)}
          onClick={() => onPick(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeScene({ theme, setTheme }) {
  const scene = theme.scene ?? {};
  const set = (patch) => setTheme((t) => ({ scene: { ...t.scene, ...patch } }));
  const decor = scene.decor ?? [];
  const particles = particleList(scene.particles);
  const toggleDecor = (value) =>
    set({
      decor: decor.includes(value)
        ? decor.filter((d) => d !== value)
        : [...decor, value],
    });
  const hasTree = decor.some((d) => ["sakura", "maple", "pines"].includes(d));

  return (
    <section className="space-y-5">
      <div>
        <h3 className="font-bold">Scene</h3>
        <p className="text-xs opacity-60">
          A sky, scenery, and little falling or floating things behind the whole
          page.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Sky</h4>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {moodOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set({ sky: o.value })}
              className={`rounded-box overflow-hidden border-2 text-left text-xs font-semibold ${(scene.sky ?? "none") === o.value ? "border-primary" : "border-base-300"}`}
            >
              <span
                className="block h-10"
                style={{
                  background:
                    moods[o.value]?.sky ??
                    (o.value === "custom"
                      ? `linear-gradient(180deg, ${scene.skyTop ?? "#9fd3ff"}, ${scene.skyBottom ?? "#fff0f6"})`
                      : theme.colors["base-100"]),
                }}
              />
              <span className="block px-2 py-1">{o.label}</span>
            </button>
          ))}
        </div>
        {scene.sky === "custom" && (
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={scene.skyTop ?? "#9fd3ff"}
                onChange={(e) => set({ skyTop: e.target.value })}
              />{" "}
              Top
            </label>
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={scene.skyBottom ?? "#fff0f6"}
                onChange={(e) => set({ skyBottom: e.target.value })}
              />{" "}
              Bottom
            </label>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Scenery (pick any)</h4>
        <div className="flex flex-wrap gap-2">
          {decorOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={chip(decor.includes(o.value))}
              aria-pressed={decor.includes(o.value)}
              onClick={() => toggleDecor(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {hasTree && (
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-70">Trees on the</span>
            <Choice
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "both", label: "Both sides" },
              ]}
              value={scene.side ?? "right"}
              onPick={(side) => set({ side })}
            />
          </div>
        )}
        {decor.includes("pines") && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={scene.snowyTrees !== false}
              onChange={(e) => set({ snowyTrees: e.target.checked })}
            />
            Snow on the pine trees
          </label>
        )}
        <p className="text-xs opacity-60">
          Scenery colors follow the sky: a blossom tree is bright by day, a
          silhouette at sunset, and glowing at night.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Falling & floating (pick any)</h4>
        <div className="flex flex-wrap gap-2">
          {particleOptions
            .filter((o) => o.value !== "none")
            .map((o) => {
              const on = particles.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  className={chip(on)}
                  aria-pressed={on}
                  onClick={() =>
                    set({
                      particles: on
                        ? particles.filter((p) => p !== o.value)
                        : [...particles, o.value],
                    })
                  }
                >
                  {o.label}
                </button>
              );
            })}
        </div>
        {particles.length > 0 && (
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="space-y-1">
              <span className="opacity-70">How many</span>
              <Choice
                options={[
                  { value: "few", label: "A few" },
                  { value: "some", label: "Some" },
                  { value: "lots", label: "Lots" },
                ]}
                value={scene.amount ?? "some"}
                onPick={(amount) => set({ amount })}
              />
            </div>
            <div className="space-y-1">
              <span className="opacity-70">Speed</span>
              <Choice
                options={[
                  { value: "calm", label: "Calm" },
                  { value: "normal", label: "Normal" },
                  { value: "lively", label: "Lively" },
                ]}
                value={scene.speed ?? "normal"}
                onPick={(speed) => set({ speed })}
              />
            </div>
          </div>
        )}
        <p className="text-xs opacity-60">
          Visitors who turned on "reduce motion" on their device see a still
          scene.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Readability</h4>
        <Choice
          options={[
            { value: "none", label: "No panel" },
            { value: "soft", label: "Soft panel" },
            { value: "strong", label: "Solid panel" },
            { value: "card", label: "White card" },
          ]}
          value={scene.veil ?? "soft"}
          onPick={(veil) => set({ veil })}
        />
        <p className="text-xs opacity-60">
          A frosted panel behind each section keeps text readable over the
          scene.
        </p>
      </div>
    </section>
  );
}
