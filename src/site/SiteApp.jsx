// The public website: shows the saved page that matches the address bar.
// Moving between pages happens in place (no full reload), so there's no blank flash.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Render } from "@puckeditor/core/rsc";
import { config } from "../builder/config.jsx";
import {
  findPageBySlug,
  loadSite,
  onSiteSaved,
} from "../services/site-store.js";
import { SiteChrome } from "./SiteChrome.jsx";
import { frameInfo } from "./frame-info.js";
import { createLiveSite } from "./live-site.js";
import { stripBase } from "../lib/base-path.js";

const slugFromLocation = () =>
  stripBase(location.pathname).replace(/\/+$/, "") || "/";

/** Remembered so index.html can paint the right background before the site has loaded. */
const BG_KEY = "site-bg";

/** A click on a link to another page of this site that we can handle without reloading. */
function internalLinkTarget(event) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return null;
  const link = event.target.closest?.("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download"))
    return null;
  const url = new URL(link.href, location.href);
  if (
    url.origin !== location.origin ||
    stripBase(url.pathname).startsWith("/admin")
  )
    return null;
  if (url.pathname === location.pathname && url.hash) return null; // same-page anchor
  return url;
}

export function SiteApp() {
  const [site, setSite] = useState(null);
  const [slug, setSlug] = useState(slugFromLocation);

  useEffect(() => {
    document.documentElement.classList.add("is-site");
    loadSite().then(setSite);
    // Show changes published in the editor without needing a manual refresh.
    return onSiteSaved(() => loadSite().then(setSite));
  }, []);

  // In-place navigation for links and the browser's back/forward buttons.
  useEffect(() => {
    const onClick = (event) => {
      const url = internalLinkTarget(event);
      if (!url) return;
      event.preventDefault();
      if (url.pathname !== location.pathname)
        history.pushState(null, "", url.pathname + url.search);
      document.querySelector("details[open]")?.removeAttribute("open"); // close the phone menu
      setSlug(slugFromLocation());
      window.scrollTo({ top: 0 });
    };
    const onPop = () => setSlug(slugFromLocation());
    document.addEventListener("click", onClick);
    addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener("popstate", onPop);
    };
  }, []);

  const page = site && findPageBySlug(site, slug);

  // Theme and shared content go through a live store (see live-site.js).
  const frame = useMemo(
    () => site && { site: frameInfo(site), content: site.content },
    [site],
  );
  const live = useRef(null);
  if (frame && !live.current) live.current = createLiveSite(frame);
  useLayoutEffect(() => {
    if (frame) live.current.set(frame);
  }, [frame]);
  const metadata = useMemo(
    () => ({ live: live.current, currentSlug: slug }),
    [slug, !!frame],
  );

  useEffect(() => {
    if (!site) return;
    const bg = site.theme?.colors?.["base-100"];
    if (bg) {
      localStorage.setItem(BG_KEY, bg);
      document.documentElement.style.background = bg;
    }
  }, [site]);

  useEffect(() => {
    const { title, description } = page?.data.root?.props ?? {};
    document.title = page ? title || page.title : "Page not found";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description ?? "");
  }, [page]);

  if (!site) return null;
  if (!page) {
    return (
      <SiteChrome site={site} currentSlug={slug}>
        <section className="mx-auto max-w-3xl space-y-6 px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold">Page not found</h1>
          <p className="opacity-70">This page doesn't exist (anymore).</p>
          <a href="/" className="btn btn-primary">
            Back to the home page
          </a>
        </section>
      </SiteChrome>
    );
  }
  return <Render config={config} data={page.data} metadata={metadata} />;
}
