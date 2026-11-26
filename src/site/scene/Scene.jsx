// The themed scene behind the whole page: sky, scenery, and falling/floating bits.
import { Decorations } from "./decorations.jsx";
import { ParticleLayers } from "./particles.jsx";
import { moodFor, moods, particleList } from "./moods.js";
import { CustomParticles, Stickers } from "./custom.jsx";

const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v ?? "");

function skyBackground(scene) {
  if (scene.sky === "custom") {
    const top = isHex(scene.skyTop) ? scene.skyTop : "#9fd3ff";
    const bottom = isHex(scene.skyBottom) ? scene.skyBottom : "#fff0f6";
    return `linear-gradient(180deg, ${top}, ${bottom})`;
  }
  return moods[scene.sky]?.sky;
}

export const hasScene = (scene) =>
  !!scene &&
  ((scene.sky && scene.sky !== "none") ||
    scene.decor?.length > 0 ||
    particleList(scene.particles).length > 0 ||
    scene.custom?.some((c) => c?.value) ||
    scene.stickers?.some((s) => s?.image));

/** `parallax`: far-away things (sun, moon, clouds, rainbow) drift slowly while scrolling. */
export function Scene({ scene, parallax = false }) {
  if (!hasScene(scene)) return null;
  const mood = moodFor(scene);
  return (
    <div
      className={`scene-layer ${parallax ? "scene-parallax-on" : ""}`}
      style={{ background: skyBackground(scene) }}
      aria-hidden="true"
    >
      <Decorations
        decor={scene.decor}
        mood={mood}
        snowyTrees={scene.snowyTrees !== false}
        side={scene.side}
      />
      <ParticleLayers
        types={particleList(scene.particles)}
        amount={scene.amount}
        speed={scene.speed}
        mood={mood}
      />
      <CustomParticles items={scene.custom} />
      <Stickers items={scene.stickers} />
    </div>
  );
}
