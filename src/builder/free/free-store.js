// A small bridge between the page blocks / settings panel and the Puck editor.
// The editor registers itself here (see src/editor/FreeHelpers.jsx); on the public site nothing
// registers, so every function is a harmless no-op there. Keeps the editor out of the site bundle.
import { useSyncExternalStore } from "react";

let getPuck = null;
let selection = null;
const listeners = new Set();

export function registerPuck(getter) {
  getPuck = getter;
}

const same = (a, b) =>
  a === b ||
  (!!a &&
    !!b &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => a[key] === b[key]));

/** What's selected: { id, type, zone, inFree, sectionId, style } or null. */
export function setSelection(next) {
  if (same(next, selection)) return;
  selection = next;
  listeners.forEach((l) => l());
}
export function useSelection() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => selection,
    () => null,
  );
}

const puck = () => getPuck?.();

/** Change one block's props by id. `fn` gets the old props and returns the new ones. */
export function updateProps(id, fn) {
  const p = puck();
  const item = p?.getItemById(id);
  const at = p?.getSelectorForId(id);
  if (!item || !at) return;
  p.dispatch({
    type: "replace",
    destinationIndex: at.index,
    destinationZone: at.zone,
    data: { ...item, props: fn(item.props) },
  });
}

export const updateFree = (id, patch) =>
  updateProps(id, (props) => ({
    ...props,
    style: { ...props.style, free: { ...props.style?.free, ...patch } },
  }));

/** The Section a block lives in (walking up through Columns and Cards). */
export function sectionOf(id) {
  const p = puck();
  let current = p?.getItemById(id);
  while (current) {
    const parent = p.getParentById(current.props.id);
    if (!parent) return null;
    if (parent.type === "Section") return parent;
    current = parent;
  }
  return null;
}

const zoneItems = (p, zone) => {
  const [parentId, slot] = zone.split(":");
  return p.getItemById(parentId)?.props?.[slot] ?? [];
};

/** Moves a block into (or out of) its Section's free layer, keeping it where it is on screen. */
export function setFreePlacement(id, on, placement) {
  const p = puck();
  const at = p?.getSelectorForId(id);
  const section = sectionOf(id);
  if (!at || !section) return false;
  const zone = `${section.props.id}:${on ? "free" : "blocks"}`;
  const destinationIndex = on
    ? zoneItems(p, zone).length
    : Math.min(placement?.flowIndex ?? Infinity, zoneItems(p, zone).length);
  // Save the new position first (while it's still selected where it is), then move it, then
  // re-select it at its new spot, so the settings panel always shows this block's numbers.
  if (on && placement?.free) updateFree(id, placement.free);
  const from = p.getSelectorForId(id);
  p.dispatch({
    type: "move",
    sourceIndex: from.index,
    sourceZone: from.zone,
    destinationIndex,
    destinationZone: zone,
  });
  select(id);
  return true;
}

export function select(id) {
  const p = puck();
  const at = p?.getSelectorForId(id);
  if (at) p.dispatch({ type: "setUi", ui: { itemSelector: at } });
}

/** Adds a new block. `zone` is "<parentId>:<slot>". Returns the new block's id. */
export function insertBlock(type, zone, index, props) {
  const p = puck();
  if (!p) return null;
  const id = `${type}-${crypto.randomUUID()}`;
  const at = Math.min(index ?? Infinity, zoneItems(p, zone).length);
  p.dispatch({
    type: "insert",
    componentType: type,
    destinationIndex: at,
    destinationZone: zone,
    id,
  });
  select(id);
  updateProps(id, (old) => ({ ...old, ...props, id }));
  return id;
}

/** Highest layer number among the other free items in the same Section. */
export function topLayer(id, direction = 1) {
  const p = puck();
  const at = p?.getSelectorForId(id);
  if (!at) return 1;
  const zs = zoneItems(p, at.zone)
    .filter((b) => b.props.id !== id)
    .map((b) => b.props.style?.free?.z ?? 1);
  if (!zs.length) return 1;
  return direction > 0 ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
}
