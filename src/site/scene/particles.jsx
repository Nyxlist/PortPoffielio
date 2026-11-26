// Falling or floating bits: petals, leaves, snow, stars, bubbles, hearts, sparkles,
// fireflies, shooting stars, lanterns, confetti. Several kinds can be on at once.
// Pure CSS animation (see main.css), so it stays smooth and costs almost nothing.
import { seeded } from "./random.js";

const amounts = { few: 12, some: 24, lots: 40 };
const speeds = { calm: 1.6, normal: 1, lively: 0.6 };

const shapes = {
  petals: (color) => (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <path d="M10 1 C16 5 17 13 10 19 C3 13 4 5 10 1Z" fill={color} />
    </svg>
  ),
  leaves: (color) => (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M12 1 L14 7 L20 5 L17 11 L23 13 L17 15 L19 21 L13 18 L12 23 L11 18 L5 21 L7 15 L1 13 L7 11 L4 5 L10 7Z"
        fill={color}
      />
    </svg>
  ),
  snow: () => <span className="scene-snow" />,
  bubbles: () => <span className="scene-bubble" />,
  hearts: () => (
    <svg viewBox="0 0 24 22" width="16" height="15">
      <path
        d="M12 21 C5 15 1 11 1 6.5 C1 3.4 3.4 1 6.5 1 C8.6 1 10.6 2.2 12 4 C13.4 2.2 15.4 1 17.5 1 C20.6 1 23 3.4 23 6.5 C23 11 19 15 12 21Z"
        fill="var(--color-primary)"
      />
    </svg>
  ),
  sparkles: () => (
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path
        d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z"
        fill="var(--color-accent)"
      />
    </svg>
  ),
  stars: () => <span className="scene-star" />,
  // Soft white four-point glints, like the sparkles on her Carrd page.
  glints: () => (
    <svg viewBox="0 0 24 24" width="30" height="30" className="scene-glint">
      <path
        d="M12 0 C12.6 9 15 11.4 24 12 C15 12.6 12.6 15 12 24 C11.4 15 9 12.6 0 12 C9 11.4 11.4 9 12 0Z"
        fill="#fff"
      />
    </svg>
  ),
  fireflies: () => <span className="scene-firefly" />,
  shooting: () => <span className="scene-shooting" />,
  lanterns: () => (
    <svg viewBox="0 0 20 28" width="18" height="25" className="scene-lantern">
      <path d="M4 4 H16 L18 22 C18 25 2 25 2 22Z" fill="#ffb347" />
      <path d="M6 6 H14 L15 20 C15 22 5 22 5 20Z" fill="#ffe08a" />
    </svg>
  ),
  confetti: (_, i) => (
    <span
      className="scene-confetti"
      style={{
        background: [
          "var(--color-primary)",
          "var(--color-secondary)",
          "var(--color-accent)",
          "#ffe066",
        ][i % 4],
      }}
    />
  ),
};

/** Which way each kind moves: falls down, rises up, or stays put and twinkles. */
const motion = {
  bubbles: "rise",
  lanterns: "rise",
  stars: "twinkle",
  sparkles: "twinkle",
  glints: "twinkle",
  fireflies: "wander",
  shooting: "shoot",
};
/** Shooting stars should be rare; fireflies a little fewer than petals. */
const countFactor = { shooting: 0.25, fireflies: 0.75, lanterns: 0.5 };

/** One layer per chosen kind. */
export function ParticleLayers({ types, ...rest }) {
  return types.map((type) => <Particles key={type} type={type} {...rest} />);
}

export function Particles({ type, amount = "some", speed = "normal", mood }) {
  if (!type || type === "none" || !shapes[type]) return null;
  const rand = seeded(type.length * 97 + 13);
  const count = Math.max(
    3,
    Math.round((amounts[amount] ?? amounts.some) * (countFactor[type] ?? 1)),
  );
  const pace = speeds[speed] ?? 1;
  const colors = type === "leaves" ? mood.maple.blossoms : mood.sakura.blossoms;
  const kind = motion[type] ?? "fall";

  return (
    <div className={`scene-particles scene-${kind}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const base =
          {
            twinkle: 2 + rand() * 3,
            wander: 6 + rand() * 6,
            shoot: 6 + rand() * 10,
          }[kind] ?? 9 + rand() * 8;
        const duration = base * pace;
        const placed =
          kind === "twinkle" || kind === "wander" || kind === "shoot";
        const style = {
          left: `${rand() * 100}%`,
          top: placed
            ? `${rand() * (kind === "wander" ? 85 : 55)}%`
            : undefined,
          animationDuration: `${duration}s`,
          animationDelay: `${-rand() * duration}s`,
          "--drift": `${(rand() - 0.5) * 30}vw`,
          "--spin": `${(rand() - 0.5) * 720}deg`,
          scale: String(0.6 + rand() * 0.8),
        };
        return (
          <span key={i} className="scene-p" style={style}>
            <span
              className="scene-p-sway"
              style={{ animationDuration: `${2.5 + rand() * 2}s` }}
            >
              {shapes[type](colors[i % colors.length], i)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
