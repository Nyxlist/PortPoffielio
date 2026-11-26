// Only allow link and image sources that can't run code.
// In-site addresses ("/queue", "/starter/…") get the site's base path (GitHub Pages).
import { withBase } from "./base-path.js";

/** Web, mail, in-site, and anchor links. Anything else (e.g. "javascript:") becomes "#". */
export function safeUrl(url) {
  return /^(https?:|mailto:|\/|#)/i.test(url ?? "") ? withBase(url) : "#";
}

/** Uploaded images (data:image/…) and web images. */
export function safeImageUrl(url) {
  return /^(https?:|data:image\/(png|jpe?g|webp|gif);|\/)/i.test(url ?? "")
    ? withBase(url)
    : "";
}
