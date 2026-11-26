// More scenery: city skyline, mountains, beach with a palm tree, rainbow.
// Same idea as decorations.jsx: drawn in SVG, colors from the time-of-day mood.
import { seeded } from "./random.js";

/** Rows of buildings along the bottom; some windows are lit (more at night). */
export function City({ colors }) {
  const rand = seeded(42);
  const rows = [
    {
      color: colors.buildings[0],
      baseY: 300,
      minH: 90,
      maxH: 210,
      opacity: 0.8,
    },
    { color: colors.buildings[1], baseY: 320, minH: 60, maxH: 170, opacity: 1 },
  ];
  const shapes = [];
  rows.forEach((row, r) => {
    let x = -10;
    while (x < 1440) {
      const w = 50 + rand() * 70;
      const h = row.minH + rand() * (row.maxH - row.minH);
      const top = row.baseY - h;
      shapes.push(
        <rect
          key={`b${r}-${x}`}
          x={x}
          y={top}
          width={w}
          height={h + 10}
          fill={row.color}
          opacity={row.opacity}
        />,
      );
      if (r === 1) {
        for (let wy = top + 12; wy < row.baseY - 14; wy += 18) {
          for (let wx = x + 8; wx < x + w - 10; wx += 14) {
            if (rand() < colors.lit)
              shapes.push(
                <rect
                  key={`w${wx}-${wy}`}
                  x={wx}
                  y={wy}
                  width="6"
                  height="8"
                  fill={colors.windows}
                  opacity="0.9"
                />,
              );
          }
        }
      }
      x += w + 4 + rand() * 10;
    }
  });
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      className="scene-ground scene-tall"
      aria-hidden="true"
    >
      {shapes}
    </svg>
  );
}

export function Mountains({ colors }) {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="none"
      className="scene-ground scene-tall"
      aria-hidden="true"
    >
      <path
        fill={colors[0]}
        d="M0 210 L180 90 L330 190 L520 60 L700 200 L880 80 L1060 180 L1250 70 L1440 170 L1440 360 L0 360Z"
        opacity="0.7"
      />
      <path
        fill="#ffffff"
        opacity="0.55"
        d="M520 60 L560 92 L540 90 L520 104 L500 90 L482 92Z M1250 70 L1290 100 L1270 98 L1250 112 L1232 98 L1212 100Z"
      />
      <path
        fill={colors[1]}
        d="M0 260 L220 150 L420 250 L640 140 L860 260 L1100 160 L1300 250 L1440 200 L1440 360 L0 360Z"
      />
      <path
        fill={colors[2]}
        d="M0 320 L260 250 L520 310 L800 240 L1080 310 L1300 260 L1440 300 L1440 360 L0 360Z"
      />
    </svg>
  );
}

/** Sand along the bottom and a palm tree leaning in from the side. */
export function Beach({ colors, side = "right" }) {
  const flip = side === "left";
  return (
    <>
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="scene-ground"
        aria-hidden="true"
      >
        <path
          fill={colors.sand}
          d="M0 120 C300 90 600 140 900 110 C1150 85 1300 120 1440 100 L1440 200 L0 200Z"
        />
      </svg>
      <div
        className={`scene-tree-wrap scene-${flip ? "left" : "right"}`}
        style={{ height: "min(62vh, 500px)" }}
      >
        <svg viewBox="0 0 320 420" className="scene-tree" aria-hidden="true">
          <path
            d="M230 420 C222 340 200 260 160 190 C150 172 142 160 132 150"
            stroke={colors.palmTrunk}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
          {[
            "M132 150 C100 120 60 120 20 150 C60 135 100 140 132 150Z",
            "M132 150 C110 100 80 80 40 80 C80 95 110 120 132 150Z",
            "M132 150 C140 100 170 70 210 60 C180 85 150 115 132 150Z",
            "M132 150 C170 130 220 135 260 165 C220 150 170 145 132 150Z",
            "M132 150 C150 165 170 200 175 240 C160 205 145 175 132 150Z",
            "M132 150 C110 170 95 200 92 236 C108 200 120 172 132 150Z",
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              fill={colors.palmLeaves}
              stroke={colors.palmLeaves}
              strokeWidth="10"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="128" cy="160" r="9" fill={colors.palmTrunk} />
          <circle cx="142" cy="162" r="8" fill={colors.palmTrunk} />
        </svg>
      </div>
    </>
  );
}

export function Rainbow({ opacity }) {
  if (!opacity) return null;
  const bands = [
    "#ff6b6b",
    "#ffa94d",
    "#ffe066",
    "#69db7c",
    "#4dabf7",
    "#9775fa",
  ];
  return (
    <svg
      viewBox="0 0 600 300"
      className="scene-rainbow"
      style={{ opacity }}
      aria-hidden="true"
    >
      {bands.map((color, i) => (
        <path
          key={color}
          d={`M${40 + i * 18} 300 A${260 - i * 18} ${260 - i * 18} 0 0 1 ${560 - i * 18} 300`}
          stroke={color}
          strokeWidth="18"
          fill="none"
        />
      ))}
    </svg>
  );
}
