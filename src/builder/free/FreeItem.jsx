// A block placed freely inside a Section. In the editor it can be dragged anywhere, resized
// from its edges/corner, and turned with the round handle on top, like in Figma.
// While dragging, only the element's style changes (smooth); the result is saved on release.
import { useEffect, useRef } from "react";
import { frameScale, freeBoxStyle } from "./frame.js";
import { select, updateFree } from "./free-store.js";

const MIN = 16;
const handles = ["e", "s", "se", "rot"];

/** Is the click inside text she is currently typing in? Then let her select text instead. */
const isTyping = (target) =>
  !!target.closest?.("[contenteditable=true]") &&
  target.ownerDocument.activeElement?.isContentEditable;

export function FreeItem({ id, f, editing, dragRef, attrs, children }) {
  const el = useRef(null);
  const latest = useRef(f);
  latest.current = f;
  const setRef = (node) => {
    el.current = node;
    dragRef?.(node);
  };

  // Listen before the editor's own block-dragging does (capture phase), and keep the press to
  // ourselves; otherwise the editor would also pick the block up and drop it into the layout.
  useEffect(() => {
    const node = el.current;
    if (!editing || !node) return;
    const listener = (event) => {
      if (event.button !== 0 || isTyping(event.target)) return;
      event.stopImmediatePropagation();
      startDrag(event, node, id, latest.current);
    };
    node.addEventListener("pointerdown", listener, { capture: true });
    return () =>
      node.removeEventListener("pointerdown", listener, { capture: true });
  }, [editing, id]);

  return (
    <div ref={setRef} {...attrs} className="free-item" style={freeBoxStyle(f)}>
      {children}
      {editing &&
        handles.map((h) => (
          <span
            key={h}
            className={`free-handle free-handle-${h}`}
            data-free-handle={h}
            title={h === "rot" ? "Turn (hold Shift to snap)" : "Resize"}
          />
        ))}
    </div>
  );
}

/** Follows the mouse until release: move, resize, or turn, depending on what was grabbed. */
function startDrag(event, node, id, f) {
  const mode = event.target.dataset?.freeHandle ?? "move";
  const k = frameScale(node);
  const start = { x: event.clientX, y: event.clientY };
  const height = node.offsetHeight;
  const box = node.getBoundingClientRect();
  const center = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  let next = { ...f };
  let moved = false;

  const onMove = (e) => {
    const dx = (e.clientX - start.x) / k;
    const dy = (e.clientY - start.y) / k;
    if (!moved && Math.hypot(dx, dy) * k < 3) return;
    if (!moved) node.ownerDocument.getSelection()?.removeAllRanges();
    moved = true;
    next = { ...f };
    if (mode === "move") {
      next.x = Math.round(f.x + dx);
      next.y = Math.round(f.y + dy);
    }
    if (mode === "e" || mode === "se")
      next.w = Math.max(MIN, Math.round(f.w + dx));
    if (mode === "s" || (mode === "se" && f.h))
      next.h = Math.max(MIN, Math.round((f.h ?? height) + dy));
    if (mode === "se" && e.shiftKey && f.h) {
      // Shift keeps the shape (aspect ratio) while resizing from the corner.
      next.h = Math.round((next.w / f.w) * f.h);
    }
    if (mode === "rot") {
      const angle =
        (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) /
          Math.PI +
        90;
      next.rot = e.shiftKey ? Math.round(angle / 15) * 15 : Math.round(angle);
    }
    Object.assign(node.style, freeBoxStyle(next));
    node.firstElementChild?.style.setProperty("rotate", `${next.rot ?? 0}deg`);
  };
  const onUp = () => {
    node.ownerDocument.removeEventListener("pointermove", onMove);
    node.ownerDocument.removeEventListener("pointerup", onUp);
    node.removeAttribute("data-free-dragging");
    // Select it first, so the settings panel shows this block's new numbers.
    select(id);
    if (moved) updateFree(id, next);
  };
  node.setAttribute("data-free-dragging", "");
  node.ownerDocument.addEventListener("pointermove", onMove);
  node.ownerDocument.addEventListener("pointerup", onUp);
}
