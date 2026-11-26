// Where the whole site (pages, theme, shared content) is saved.
// For now it lives in the browser's IndexedDB, so it only exists on this computer.
// When Supabase is set up, only this file needs to change.
import { get, set, del } from "idb-keyval";
import { createDefaultSite } from "../data/default-site.js";
import { migrate } from "./migrations.js";

const KEY = "site";
// Tells other open tabs (e.g. the public site) that the site changed, so they refresh.
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("site-updates")
    : null;

export async function loadSite() {
  const site = await get(KEY);
  return site ? migrate(site) : createDefaultSite();
}

export async function saveSite(site) {
  await set(KEY, site);
  channel?.postMessage("saved");
}

/** Calls `callback` whenever the site is saved in another tab. Returns a function that stops listening. */
export function onSiteSaved(callback) {
  if (!channel) return () => {};
  const listener = () => callback();
  channel.addEventListener("message", listener);
  return () => channel.removeEventListener("message", listener);
}

/** Throws away all edits and goes back to the starting pages. */
export async function resetSite() {
  await del(KEY);
  return createDefaultSite();
}

export function findPageBySlug(site, slug) {
  return site.pages.find((page) => page.slug === slug);
}

/** "My Page!" → "/my-page" */
export function slugify(title) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
  return `/${slug || "page"}`;
}
