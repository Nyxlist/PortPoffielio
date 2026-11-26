// Scenery drawn in SVG. Colors come from the time-of-day mood, so one drawing works
// for day, sunset, and night. Random-looking details use a fixed seed, so they never jump.
import { Beach, City, Mountains, Rainbow } from "./scenery-extra.jsx";
import { seeded } from "./random.js";

// Branch skeleton shared by the blossom and autumn trees (viewBox 0 0 320 420, trunk at bottom center).
const branches = [
  { d: "M168 420 C160 360 150 320 158 270 C164 235 152 205 140 180", w: 26 },
  { d: "M155 265 C120 245 90 225 62 175", w: 13 },
  { d: "M150 215 C180 190 205 170 236 128", w: 12 },
  { d: "M142 185 C130 150 128 120 118 88", w: 10 },
  { d: "M160 300 C200 285 235 260 262 214", w: 11 },
  { d: "M88 214 C70 205 52 200 34 205", w: 6 },
  { d: "M210 160 C225 160 245 168 268 170", w: 6 },
];
const clusterCenters = [
  [62, 165],
  [36, 200],
  [96, 128],
  [118, 80],
  [150, 70],
  [190, 100],
  [236, 118],
  [270, 165],
  [262, 210],
  [214, 165],
  [170, 140],
  [120, 165],
  [80, 215],
  [228, 240],
];

function BlossomTree({ colors, seed, petalCount = 16 }) {
  const rand = seeded(seed);
  const dots = [];
  clusterCenters.forEach(([cx, cy], c) => {
    for (let i = 0; i < petalCount; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * 34;
      dots.push({
        key: `${c}-${i}`,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.8,
        r: 9 + rand() * 12,
        fill: colors.blossoms[Math.floor(rand() * colors.blossoms.length)],
      });
    }
  });
  return (
    <svg viewBox="0 0 320 420" className="scene-tree" aria-hidden="true">
      {branches.map((b, i) => (
        <path
          key={i}
          d={b.d}
          stroke={colors.trunk}
          strokeWidth={b.w}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {dots.map((d) => (
        <circle
          key={d.key}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={d.fill}
          opacity={0.92}
        />
      ))}
    </svg>
  );
}

function Pines({ colors, snowy = true }) {
  const tree = (x, scale) => (
    <g transform={`translate(${x} ${420 - 300 * scale}) scale(${scale})`}>
      <rect
        x="44"
        y="250"
        width="22"
        height="50"
        fill={colors.tree}
        opacity="0.85"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <polygon
            points={`55,${i * 70} ${-5 + i * -8},${110 + i * 70} ${115 + i * 8},${110 + i * 70}`}
            fill={colors.tree}
          />
          {snowy && (
            <polygon
              points={`55,${i * 70} ${30 - i * 4},${35 + i * 70} ${80 + i * 4},${35 + i * 70}`}
              fill={colors.snow}
            />
          )}
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 320 420" className="scene-tree" aria-hidden="true">
      {tree(10, 0.75)}
      {tree(120, 1)}
      {tree(230, 0.6)}
    </svg>
  );
}

function Orb({ color, glow, size, x, y }) {
  return (
    <div
      className="scene-orb"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        // Disc fades straight into the glow color, so there's no dark gap at the edge.
        background: `radial-gradient(circle closest-side, ${color} 80%, ${glow} 100%)`,
        boxShadow: `0 0 ${size / 1.5}px ${size / 4}px ${glow}`,
      }}
    />
  );
}

function Clouds({ color }) {
  const cloud = (top, scale, duration, delay) => (
    <svg
      key={top}
      viewBox="0 0 200 80"
      className="scene-cloud"
      style={{
        top,
        width: 220 * scale,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
      aria-hidden="true"
    >
      <g fill={color} opacity="0.85">
        <ellipse cx="60" cy="50" rx="45" ry="25" />
        <ellipse cx="100" cy="38" rx="40" ry="32" />
        <ellipse cx="140" cy="52" rx="42" ry="24" />
      </g>
    </svg>
  );
  return (
    <>
      {cloud("8%", 1, 120, -20)}
      {cloud("20%", 0.7, 160, -90)}
      {cloud("32%", 0.85, 140, -55)}
    </>
  );
}

function Hills({ colors }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className="scene-ground"
      aria-hidden="true"
    >
      <path
        fill={colors[0]}
        d="M0 190 C240 120 420 210 660 170 C900 130 1080 200 1440 140 L1440 320 L0 320Z"
      />
      <path
        fill={colors[1]}
        d="M0 240 C200 200 380 260 620 230 C860 200 1100 260 1440 215 L1440 320 L0 320Z"
      />
      <path
        fill={colors[2]}
        d="M0 285 C260 260 520 300 760 280 C1000 262 1220 296 1440 275 L1440 320 L0 320Z"
      />
    </svg>
  );
}

function Waves({ colors }) {
  const wave = (fill, y, duration) => (
    <svg
      viewBox="0 0 2880 200"
      preserveAspectRatio="none"
      className="scene-wave"
      style={{ animationDuration: `${duration}s` }}
      aria-hidden="true"
    >
      <path
        fill={fill}
        d={`M0 ${y} C360 ${y - 40} 720 ${y + 40} 1080 ${y} S1800 ${y - 40} 2160 ${y} S2520 ${y + 40} 2880 ${y} L2880 200 L0 200Z`}
        opacity="0.85"
      />
    </svg>
  );
  return (
    <div className="scene-ground">
      {wave(colors[0], 90, 18)}
      {wave(colors[1], 130, 12)}
    </div>
  );
}

/** Draws the chosen scenery pieces for a mood. `side` is where trees stand. */
export function Decorations({
  decor = [],
  mood,
  side = "right",
  snowyTrees = true,
}) {
  const has = (name) => decor.includes(name);
  const treeSides = side === "both" ? ["left", "right"] : [side];
  const hasTree = ["sakura", "maple", "pines"].some(has);
  // The palm stands on the other side from the trees, so they don't overlap.
  const palmSide = hasTree
    ? side === "left"
      ? "right"
      : "left"
    : side === "left"
      ? "left"
      : "right";
  return (
    <>
      {has("sun") && mood.sun && <Orb {...mood.sun} />}
      {has("moon") && (
        <Orb
          {...(mood.moon ?? {
            color: "#fff6d8",
            glow: "#ffffff88",
            x: "82%",
            y: "12%",
            size: 80,
          })}
        />
      )}
      {has("rainbow") && <Rainbow opacity={mood.rainbow} />}
      {has("clouds") && <Clouds color={mood.cloud} />}
      {has("mountains") && <Mountains colors={mood.mountains} />}
      {has("city") && <City colors={mood.city} />}
      {has("hills") && <Hills colors={mood.hills} />}
      {has("beach") && <Beach colors={mood.beach} side={palmSide} />}
      {has("waves") && <Waves colors={mood.water} />}
      {hasTree &&
        treeSides.map((s) => (
          <div key={s} className={`scene-tree-wrap scene-${s}`}>
            {has("sakura") && (
              <BlossomTree colors={mood.sakura} seed={s === "left" ? 7 : 3} />
            )}
            {has("maple") && (
              <BlossomTree
                colors={mood.maple}
                seed={s === "left" ? 11 : 5}
                petalCount={13}
              />
            )}
            {has("pines") && <Pines colors={mood.pine} snowy={snowyTrees} />}
          </div>
        ))}
    </>
  );
}
