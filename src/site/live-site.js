// A tiny live store for the site's frame info (theme, name, menu) and shared content lists.
// Pages read it through these hooks, so changing the theme only redraws the page frame and
// scene, not every block on the page (that made the editor laggy).
import { useSyncExternalStore } from "react";

export function createLiveSite(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const EMPTY = {};
const select = (store, pick) => () => (store ? pick(store.get()) : EMPTY);

/** Theme, name, footer, and menu pages for the page frame. */
export function useSiteFrame(puck) {
  const store = puck?.metadata?.live;
  const get = select(store, (v) => v.site);
  return useSyncExternalStore(store?.subscribe ?? noop, get, get);
}

/** Shared content lists (schedule, updates, fanart, socials). Only changes when the content does. */
export function useSiteContent(puck) {
  const store = puck?.metadata?.live;
  const get = select(store, (v) => v.content ?? EMPTY);
  return useSyncExternalStore(store?.subscribe ?? noop, get, get);
}

function noop() {
  return () => {};
}
