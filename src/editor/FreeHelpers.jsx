// Editor helpers for free placement and picture dropping:
// - PuckBridge lets page blocks and the Style panel talk to the editor (see free-store.js).
// - PictureDrop: drop picture files straight onto the page. They land exactly where dropped as
//   free pictures; hold Shift to add a normal Image block instead; drop onto an Image to replace it.
import { useEffect } from "react";
import { useGetPuck } from "@puckeditor/core";
import { usePuck } from "./EditorHeader.jsx";
import {
  insertBlock,
  registerPuck,
  sectionOf,
  setSelection,
  updateProps,
} from "../builder/free/free-store.js";
import { frameScale, freeOrigin } from "../builder/free/frame.js";
import { fileToResizedDataUrl } from "../lib/image.js";

export function PuckBridge() {
  const getPuck = useGetPuck();
  const selectedId = usePuck((s) => s.selectedItem?.props?.id);
  const data = usePuck((s) => s.appState.data);
  useEffect(() => {
    registerPuck(getPuck);
    return () => registerPuck(null);
  }, [getPuck]);
  useEffect(() => {
    const p = getPuck();
    const at = selectedId && p.getSelectorForId(selectedId);
    if (!at) return setSelection(null);
    const section = sectionOf(selectedId);
    const item = p.getItemById(selectedId);
    setSelection({
      id: selectedId,
      type: item?.type,
      // The block's current Style, straight from the page data (the panel can lag behind).
      style: item?.props?.style,
      zone: at.zone,
      inFree: at.zone.endsWith(":free"),
      sectionId: section?.props.id ?? null,
    });
  }, [selectedId, data, getPuck]);
  return null;
}

const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes("Files");
const pictureFrom = (e) =>
  [...(e.dataTransfer?.files ?? [])].find((f) => f.type.startsWith("image/"));

/** Which Section is at this height of the page (or the closest one). */
function sectionAt(doc, y) {
  const frames = [...doc.querySelectorAll("[data-frame-id]")];
  let best = null;
  let bestDistance = Infinity;
  for (const frame of frames) {
    const r = frame.getBoundingClientRect();
    const distance = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
    if (distance < bestDistance) [best, bestDistance] = [frame, distance];
  }
  return best;
}

async function dropPicture(doc, event) {
  const file = pictureFrom(event);
  if (!file) return;
  const src = await fileToResizedDataUrl(file, 1600);
  const hit = doc
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest("[data-block-id]");
  const imageBlock = hit?.closest('[data-block-type="Image"]');

  // Dropped onto a picture: replace it (keeps its size, shape and crop).
  if (imageBlock && !event.shiftKey) {
    updateProps(imageBlock.dataset.blockId, (props) => ({
      ...props,
      picture: { ...props.picture, src, x: 50, y: 50, zoom: 1 },
    }));
    return;
  }

  const frame =
    hit?.closest("[data-frame-id]") ?? sectionAt(doc, event.clientY);
  if (!frame)
    return alert(
      "Add a Section to the page first, then drop the picture into it.",
    );
  const sectionId = frame.dataset.frameId;
  const picture = { src, x: 50, y: 50, zoom: 1 };
  const base = { picture, frame: "original", shape: "rounded", size: 100 };

  if (event.shiftKey) {
    // As a normal block, in the spot of the layout nearest to where it was dropped.
    const flow = [...(frame.firstElementChild?.children ?? [])].filter(
      (c) => c.dataset.blockId,
    );
    const index = flow.filter((c) => {
      const r = c.getBoundingClientRect();
      return r.top + r.height / 2 < event.clientY;
    }).length;
    insertBlock("Image", `${sectionId}:blocks`, index, base);
    return;
  }

  // Free things are positioned from the section's content column.
  const origin = freeOrigin(doc, sectionId);
  const k = frameScale(frame);
  const r = (origin?.node ?? frame).getBoundingClientRect();
  const w = 360;
  insertBlock("Image", `${sectionId}:free`, Infinity, {
    ...base,
    style: {
      free: {
        x: Math.round((event.clientX - r.left) / k - w / 2),
        y: Math.round((event.clientY - r.top) / k - w / 3),
        w: Math.min(w, origin?.width ?? w),
        h: null,
        rot: 0,
        z: 1,
      },
    },
  });
}

/** Wires drag-and-drop of picture files onto the page preview (and blocks stray drops elsewhere). */
export function PictureDrop() {
  useEffect(() => {
    let doc = null;
    let target = null;
    const clearTarget = () => {
      target?.removeAttribute("data-drop-target");
      target = null;
    };
    const onOver = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      doc.body.setAttribute("data-file-drag", "");
      const hit = doc
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest('[data-block-type="Image"]');
      if (hit !== target) {
        clearTarget();
        if (hit && !e.shiftKey)
          (target = hit).setAttribute("data-drop-target", "");
      }
    };
    const onLeave = (e) => {
      if (e.relatedTarget) return;
      doc.body.removeAttribute("data-file-drag");
      clearTarget();
    };
    const onDrop = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      doc.body.removeAttribute("data-file-drag");
      clearTarget();
      dropPicture(doc, e).catch((err) => alert(err.message));
    };
    const attach = () => {
      const next = document.querySelector("#preview-frame")?.contentDocument;
      if (!next?.body || next === doc) return;
      detach();
      doc = next;
      doc.addEventListener("dragover", onOver);
      doc.addEventListener("dragleave", onLeave);
      doc.addEventListener("drop", onDrop);
    };
    const detach = () => {
      doc?.removeEventListener("dragover", onOver);
      doc?.removeEventListener("dragleave", onLeave);
      doc?.removeEventListener("drop", onDrop);
      doc = null;
    };
    // The preview can be rebuilt (page or screen-size switch), so re-attach when it changes.
    const timer = setInterval(attach, 800);
    attach();
    // Outside the preview and the picture boxes, a dropped file must not open in the tab.
    const guard = (e) => hasFiles(e) && e.preventDefault();
    addEventListener("dragover", guard);
    addEventListener("drop", guard);
    return () => {
      clearInterval(timer);
      detach();
      removeEventListener("dragover", guard);
      removeEventListener("drop", guard);
    };
  }, []);
  return null;
}
