// Free placement: every Section is a "frame" designed at FRAME_W wide. Free items store their
// position and size in that frame's units, and the whole free layer is scaled to the section's
// real width (the CSS variable --k), so the layout keeps the same proportions on a phone, a
// tablet, and a desktop. Moving something in phone view moves it in desktop view too.
import { createContext } from "react";

export const FRAME_W = 1280;

/**
 * Design width of the content column for each Section width (column max width minus its side
 * padding). On a desktop wide enough for the column, 1 frame unit = 1 pixel.
 */
export const frameWidths = {
  narrow: 720,
  normal: 976,
  wide: 1232,
  full: FRAME_W,
};

/** The element free things in a Section are positioned from, and its design width. */
export function freeOrigin(doc, sectionId) {
  const node = doc.querySelector(`[data-free-origin="${sectionId}"]`);
  return node ? { node, width: Number(node.dataset.frameW) || FRAME_W } : null;
}

/** True for blocks rendered inside a Section's free layer. Reset to false inside each block. */
export const FreeLayerContext = createContext(false);

export const defaultFree = { x: 80, y: 40, w: 360, h: null, rot: 0, z: 1 };

export const freeOf = (style) => ({ ...defaultFree, ...style?.free });

/** Position + scale for a free item. Rotation lives on the inner box so it turns around its center. */
export function freeBoxStyle(f) {
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${f.w}px`,
    height: f.h ? `${f.h}px` : undefined,
    transform: `translate(calc(var(--k, 1) * ${f.x}px), calc(var(--k, 1) * ${f.y}px)) scale(var(--k, 1))`,
    transformOrigin: "0 0",
    zIndex: f.z ?? 1,
  };
}

/** The current scale of the frame an element sits in (section width / FRAME_W). */
export function frameScale(el) {
  const k = parseFloat(getComputedStyle(el).getPropertyValue("--k"));
  return k > 0 ? k : 1;
}
