// Upgrades sites saved by older versions of the editor, so nothing she made gets lost.
import { SITE_VERSION } from "../data/default-site.js";
import { createDefaultPages } from "../data/default-pages.js";
import {
  createDefaultCommissions,
  createDefaultQueue,
} from "../data/default-commissions.js";
import { dreamweaverTheme } from "../lib/theme-presets.js";

const escapeHtml = (text = "") =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** Calls `visit` on every block on every page, including blocks inside Sections, Columns, and Cards. */
function forEachBlock(site, visit) {
  const walk = (blocks) => {
    for (const block of blocks) {
      visit(block);
      for (const value of Object.values(block.props)) {
        if (Array.isArray(value) && value[0]?.type && value[0]?.props)
          walk(value);
      }
    }
  };
  for (const page of site.pages) walk(page.data.content ?? []);
}

export function migrate(site) {
  const version = site.version ?? 1;
  if (version < 2) {
    // v2: headings went from three text pieces to one rich-text field.
    forEachBlock(site, (block) => {
      if (block.type !== "Heading") return;
      const { text, highlight, textAfter } = block.props;
      // Text with tags is read as HTML (so it's escaped); plain text is shown as-is.
      block.props.text = highlight
        ? `${escapeHtml(text)}<strong>${escapeHtml(highlight)}</strong>${escapeHtml(textAfter)}`
        : `${text ?? ""}${textAfter ?? ""}`;
      delete block.props.highlight;
      delete block.props.textAfter;
    });
  }
  if (version < 3) {
    // v3: Section/Card colors and borders moved into the shared Style settings,
    // and the Image block got cropping, sizes, and shapes.
    forEachBlock(site, (block) => {
      const p = block.props;
      if (block.type === "Section") {
        p.style = {
          ...(p.background && p.background !== "none"
            ? { bg: `theme:${p.background}` }
            : {}),
          ...p.style,
        };
        delete p.background;
      }
      if (block.type === "Card") {
        const bg = p.background ?? "base-200";
        p.style = {
          ...(bg !== "none" ? { bg: `theme:${bg}` } : {}),
          radius: "theme",
          ...(p.border ? { borderWidth: 1 } : {}),
          ...p.style,
        };
        delete p.background;
        delete p.border;
      }
      if (block.type === "Image" && !p.picture) {
        const circle = p.shape === "circle";
        p.picture = { src: p.image ?? "", x: 50, y: 50, zoom: 1 };
        p.size = { full: 100, md: 50, sm: 25 }[p.size] ?? 100;
        p.frame = circle
          ? "square"
          : ({
              square: "square",
              video: "wide",
              portrait: "portrait",
              auto: "original",
            }[p.shape] ?? "square");
        p.shape = circle
          ? "circle"
          : p.rounded === false
            ? "rectangle"
            : "rounded";
        p.align = "center";
        delete p.image;
        delete p.rounded;
      }
    });
  }
  if (version < 4) {
    // v4: every Section got a free layer (blocks placed anywhere) and an optional height.
    forEachBlock(site, (block) => {
      if (block.type !== "Section") return;
      block.props.free ??= [];
      block.props.height ??= 0;
    });
  }
  if (version < 5) upgradeToCommissions(site);
  site.version = SITE_VERSION;
  return site;
}

/**
 * v5: the stream schedule became the commission queue, with commission info.
 * - Shared content gets the queue and commission info (from her Trello and Carrd).
 * - Stream schedule blocks become queue blocks; "Stream schedule" headings and
 *   "All streams" buttons follow.
 * - The Streams page becomes the Queue page. The old page is kept, hidden from the menu,
 *   at /streams-old, so nothing she wrote is lost.
 * - A Commissions page is added if there isn't one.
 * - If she never changed the old starting theme, she gets her Carrd look (Dreamweaver).
 */
function upgradeToCommissions(site) {
  site.content.queue ??= createDefaultQueue();
  site.content.commissions ??= createDefaultCommissions();

  forEachBlock(site, (block) => {
    const p = block.props;
    if (block.type === "StreamSchedule") {
      block.type = "CommissionQueue";
      block.props = {
        id: p.id,
        style: p.style,
        show: "queue",
        limit: p.limit ?? 0,
        progress: true,
        layout: "board",
      };
    }
    if (block.type === "Heading" && p.text === "Stream schedule")
      p.text = "Commission queue";
    if (block.type === "Button" && p.link === "/streams") {
      p.link = "/queue";
      if (p.label === "All streams") p.label = "See the full queue";
    }
  });

  const fresh = createDefaultPages();
  const pageFor = (slug) => fresh.find((page) => page.slug === slug);
  const streams = site.pages.find((page) => page.slug === "/streams");
  if (streams && !site.pages.some((page) => page.slug === "/queue")) {
    const index = site.pages.indexOf(streams);
    streams.slug = "/streams-old";
    streams.title = "Streams (old)";
    streams.inNav = false;
    site.pages.splice(index, 0, pageFor("/queue"));
  }
  if (!site.pages.some((page) => page.slug === "/commissions")) {
    const queueAt = site.pages.findIndex((page) => page.slug === "/queue");
    site.pages.splice(
      queueAt + 1 || site.pages.length,
      0,
      pageFor("/commissions"),
    );
  }

  const t = site.theme;
  const untouched =
    t.colors?.primary === "#e86fa5" &&
    t.colors?.secondary === "#8b7cf6" &&
    t.font === "Nunito" &&
    !t.scene &&
    !t.pageBackground?.image;
  if (untouched) {
    const { name: _name, ...look } = structuredClone(dreamweaverTheme);
    site.theme = { ...t, ...look };
  }
}
