// The address the site lives under. "" on a normal domain (and in development);
// "/PortPoffielio" on GitHub Pages (set by BASE_PATH when building, see vite.config.js).
// Pages store their addresses without it ("/queue"), so saved sites work anywhere.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const hasBase = (path) => path === BASE || path.startsWith(`${BASE}/`);

/** "/queue" → "/PortPoffielio/queue". Leaves web links, "#…", and already-prefixed paths alone. */
export function withBase(path) {
  if (!BASE || typeof path !== "string" || !/^\/(?!\/)/.test(path)) return path;
  return hasBase(path) ? path : `${BASE}${path}`;
}

/** "/PortPoffielio/queue" → "/queue" (the address the site's pages are stored under). */
export function stripBase(pathname) {
  if (!BASE || !hasBase(pathname)) return pathname;
  return pathname.slice(BASE.length) || "/";
}
