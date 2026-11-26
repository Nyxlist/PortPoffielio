// The site as it looks before anything is saved: her own version, made in the editor
// (exported from the browser on 2026-11-26). Pictures live in public/starter/.
// To update it: export the saved site from the browser, move uploaded pictures into
// public/starter/, and replace starter-site.json. If SITE_VERSION goes up, upgrade the
// file too (run it through migrate() once), since the starter is not migrated on load.
import starter from "./starter-site.json";

export const SITE_VERSION = 5;

export function createDefaultSite() {
  return { ...structuredClone(starter), version: SITE_VERSION };
}
