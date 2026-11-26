// The frame around every page: theme colors and font, header with navigation, and footer.
import { useEffect, useState } from "react";
import {
  customFontCss,
  pageBackgroundStyle,
  themeToCssVars,
} from "../lib/theme.js";
import { Scene, hasScene } from "./scene/Scene.jsx";
import { ClickEffects } from "./effects/ClickEffects.jsx";
import { ScrollEffects } from "./effects/ScrollEffects.jsx";
import { safeImageUrl } from "../lib/safe-url.js";
import { withBase } from "../lib/base-path.js";

/**
 * `onNavigate` is set inside the editor: menu links then switch the page being edited
 * instead of leaving the editor.
 */
export function SiteChrome({ site, currentSlug, onNavigate, children }) {
  const navPages = site.pages.filter((page) => page.inNav && page.slug !== "/");
  const editing = !!onNavigate;
  const scene = site.theme.scene;
  const sceneOn = hasScene(scene);
  // Click and scroll effects only run on the real site, so they never get in the way of editing.
  const effects = editing ? {} : (site.theme.effects ?? {});
  const reveal = effects.scroll?.reveal;
  // Style animations stay off until the first paint, so cards and buttons don't flash
  // their "from" colors as they appear (see [data-ready] in main.css).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  const linkProps = (slug) =>
    editing
      ? {
          onClick: (event) => {
            event.preventDefault();
            onNavigate(slug);
          },
          title: "Edit this page",
        }
      : {};
  return (
    <div
      data-theme="site"
      data-ready={ready ? "" : undefined}
      data-scene-veil={sceneOn ? (scene.veil ?? "soft") : undefined}
      data-reveal={reveal && reveal !== "none" ? reveal : undefined}
      style={{
        ...themeToCssVars(site.theme),
        ...pageBackgroundStyle(site.theme),
      }}
      className={`bg-base-100 text-base-content flex min-h-screen flex-col font-sans antialiased ${editing ? "is-editing" : ""}`}
    >
      {/* Fonts she uploaded in the Theme panel. */}
      <style>{customFontCss(site.theme)}</style>
      {/* Sky, scenery and falling bits behind everything (Theme → Scene). */}
      <Scene scene={scene} parallax={!!effects.scroll?.parallax} />
      <ClickEffects config={effects.click} />
      <ScrollEffects config={effects.scroll} slug={currentSlug} />
      {site.theme.header === "pills" ? (
        <PillHeader
          site={site}
          pages={navPages}
          currentSlug={currentSlug}
          linkProps={linkProps}
        />
      ) : (
        /* Not sticky in the editor, so it never covers the blocks being edited. */
        <header
          className={`border-base-300 border-b ${sceneOn ? "bg-base-100/85" : "bg-base-100/90 backdrop-blur"} ${editing ? "relative z-[1]" : "sticky top-0 z-10"}`}
        >
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a
              href={withBase("/")}
              className="text-primary text-xl font-extrabold"
              {...linkProps("/")}
            >
              {site.name}
            </a>
            <NavLinks
              pages={navPages}
              currentSlug={currentSlug}
              linkProps={linkProps}
              className="hidden gap-6 text-sm font-semibold md:flex"
            />
            <details className="dropdown dropdown-end md:hidden">
              <summary
                className="btn btn-square btn-ghost"
                aria-label="Open menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <NavLinks
                pages={navPages}
                currentSlug={currentSlug}
                linkProps={linkProps}
                className="menu dropdown-content rounded-box border-base-300 bg-base-100 z-20 mt-2 w-48 border p-2 font-semibold shadow-lg"
                activeClass="bg-base-200"
              />
            </details>
          </nav>
        </header>
      )}

      {/* `key` restarts a gentle fade-in (.page-enter) whenever the page changes. */}
      <main key={currentSlug} className="page-enter relative z-[1] flex-1">
        {children}
      </main>

      <footer
        className={`border-base-300 relative z-[1] border-t ${sceneOn ? "bg-base-100/85" : ""}`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4 px-6 py-8 text-sm opacity-70">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          {site.footerNote && <p>{site.footerNote}</p>}
        </div>
      </footer>
    </div>
  );
}

function NavLinks({
  pages,
  currentSlug,
  linkProps,
  className,
  activeClass = "",
}) {
  return (
    <ul className={className}>
      {pages.map((page) => {
        const active = page.slug === currentSlug;
        return (
          <li key={page.id}>
            <a
              href={withBase(page.slug)}
              {...linkProps(page.slug)}
              aria-current={active ? "page" : undefined}
              className={
                active ? `text-primary ${activeClass}` : "hover:text-primary"
              }
            >
              {page.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Centered header like her Carrd page: her logo (or the site name in the heading font)
 * with the menu as pink pill buttons underneath. Wraps onto more rows on phones.
 */
function PillHeader({ site, pages, currentSlug, linkProps }) {
  const logo = safeImageUrl(site.theme.logo);
  const home = site.pages.find((p) => p.slug === "/");
  const links = home ? [home, ...pages] : pages;
  return (
    <header className="relative z-[1] px-4 pt-8 pb-4 text-center">
      <a href={withBase("/")} className="inline-block" {...linkProps("/")}>
        {logo ? (
          <img
            src={logo}
            alt={site.name}
            className="mx-auto max-h-36 w-auto max-w-[80vw] object-contain"
          />
        ) : (
          <span className="text-primary font-[family-name:var(--font-heading)] text-4xl sm:text-5xl">
            {site.name}
          </span>
        )}
      </a>
      <nav aria-label="Main" className="mt-4">
        <ul className="flex flex-wrap justify-center gap-2">
          {links.map((page) => (
            <li key={page.id}>
              <a
                href={withBase(page.slug)}
                className="nav-pill"
                aria-current={page.slug === currentSlug ? "page" : undefined}
                {...linkProps(page.slug)}
              >
                {page.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
