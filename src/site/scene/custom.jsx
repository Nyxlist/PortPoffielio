// Things she makes herself: falling/floating emoji, text or pictures, and stickers pinned on the page.
import { safeImageUrl } from "../../lib/safe-url.js";
import { seeded } from "./random.js";

const amounts = { few: 10, some: 20, lots: 36 };
const speeds = { calm: 1.6, normal: 1, lively: 0.6 };
const sizes = { s: 18, m: 28, l: 42, xl: 64 };
/** How each motion maps onto the shared particle animations in main.css. */
const motionClass = {
  fall: "fall",
  rise: "rise",
  float: "wander",
  twinkle: "twinkle",
};

/** The emoji, text, or picture itself. Text is shown as plain text, never as code. */
function Thing({ item, size }) {
  if (item.kind === "image") {
    const src = safeImageUrl(item.value);
    return src ? (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: "contain", display: "block" }}
        draggable={false}
      />
    ) : null;
  }
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "block",
        whiteSpace: "nowrap",
      }}
    >
      {String(item.value ?? "").slice(0, 12)}
    </span>
  );
}

function CustomLayer({ item, index }) {
  const kind = motionClass[item.motion] ?? "fall";
  const rand = seeded(97 * (index + 1) + String(item.value ?? "").length);
  const count = amounts[item.amount] ?? amounts.some;
  const pace = speeds[item.speed] ?? 1;
  const size = sizes[item.size] ?? sizes.m;
  return (
    <div className={`scene-particles scene-${kind}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const base =
          { twinkle: 2 + rand() * 3, wander: 6 + rand() * 6 }[kind] ??
          9 + rand() * 8;
        const duration = base * pace;
        const placed = kind === "twinkle" || kind === "wander";
        return (
          <span
            key={i}
            className="scene-p"
            style={{
              left: `${rand() * 100}%`,
              top: placed ? `${rand() * 85}%` : undefined,
              animationDuration: `${duration}s`,
              animationDelay: `${-rand() * duration}s`,
              "--drift": `${(rand() - 0.5) * 30}vw`,
              "--spin":
                item.spin === false ? "0deg" : `${(rand() - 0.5) * 540}deg`,
              scale: String(0.7 + rand() * 0.6),
            }}
          >
            <span
              className="scene-p-sway"
              style={{ animationDuration: `${2.5 + rand() * 2}s` }}
            >
              <Thing item={item} size={size} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function CustomParticles({ items = [] }) {
  return items
    .filter((item) => item?.value)
    .map((item, i) => <CustomLayer key={item.id ?? i} item={item} index={i} />);
}

/** Where a sticker can be pinned (as CSS positions on the fixed scene layer). */
export const stickerPositions = {
  "top-left": { top: "8%", left: "3%" },
  top: { top: "8%", left: "50%", translate: "-50% 0", "--cx": "-50%" },
  "top-right": { top: "8%", right: "3%" },
  left: { top: "45%", left: "2%" },
  right: { top: "45%", right: "2%" },
  "bottom-left": { bottom: "3%", left: "3%" },
  bottom: { bottom: "3%", left: "50%", translate: "-50% 0", "--cx": "-50%" },
  "bottom-right": { bottom: "3%", right: "3%" },
};

export function Stickers({ items = [] }) {
  return items.map((sticker, i) => {
    const src = safeImageUrl(sticker.image);
    if (!src) return null;
    const height = `${Math.max(5, Math.min(60, sticker.size ?? 20))}vh`;
    return (
      <img
        key={sticker.id ?? i}
        src={src}
        alt=""
        draggable={false}
        className={`scene-sticker ${sticker.float ? "scene-bob" : ""}`}
        style={{
          ...(stickerPositions[sticker.position] ??
            stickerPositions["bottom-right"]),
          height,
          opacity: (sticker.opacity ?? 100) / 100,
          transform: sticker.flip ? "scaleX(-1)" : undefined,
          animationDelay: `${-i * 0.7}s`,
        }}
      />
    );
  });
}
