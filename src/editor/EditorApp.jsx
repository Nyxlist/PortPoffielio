// The drag-and-drop editor at /admin. Not password-protected yet: login comes with Supabase.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Puck } from "@puckeditor/core";
import { config } from "../builder/config.jsx";
import { loadSite, resetSite, saveSite } from "../services/site-store.js";
import { CommissionsDialog } from "./commissions/CommissionsDialog.jsx";
import { ContentDialog } from "./ContentDialog.jsx";
import { PagesDialog } from "./PagesDialog.jsx";
import { ThemeDialog } from "./ThemeDialog.jsx";
import { hasSeenTour } from "./Tour.jsx";
import "./editor.css";
import { SiteContext } from "../builder/style/site-context.js";
import { EditorContext, stableOverrides } from "./editor-overrides.jsx";
import { frameInfo } from "../site/frame-info.js";
import { createLiveSite } from "../site/live-site.js";

// Puck actions that change the page (as opposed to selecting or scrolling).
const EDIT_ACTIONS = new Set([
  "insert",
  "duplicate",
  "replace",
  "replaceRoot",
  "reorder",
  "move",
  "remove",
  "setData",
]);

const dndSettings = { enableDragHandle: true, behavior: "static" };

const viewports = [
  { width: "100%", label: "Fit window", icon: "Monitor" },
  { width: 390, label: "Phone", icon: "Smartphone" },
  { width: 768, label: "Tablet", icon: "Tablet" },
  { width: 1280, label: "Desktop", icon: "Monitor" },
];
// Start with both side panels hidden and the preview at the full window width.
const initialUi = {
  leftSideBarVisible: false,
  rightSideBarVisible: false,
  viewports: {
    current: { width: "100%", height: "auto" },
    options: [],
    controlsVisible: true,
  },
};

export default function EditorApp() {
  const [site, setSite] = useState(null);
  const [pageId, setPageId] = useState(() =>
    new URLSearchParams(location.search).get("page"),
  );
  const [dialog, setDialog] = useState(null);
  const [status, setStatus] = useState("");
  const unpublished = useRef(false); // true after an edit, until Publish

  // The version of the site that's already saved. Only *changes* get saved, so just
  // opening the editor never writes anything.
  const savedSite = useRef(null);
  const showSite = (next) => {
    savedSite.current = next;
    setSite(next);
  };

  useEffect(() => {
    loadSite().then(showSite);
  }, []);

  // Save site-wide changes (theme, content, pages) shortly after they happen.
  useEffect(() => {
    if (!site || site === savedSite.current) return;
    const timer = setTimeout(() => {
      savedSite.current = site;
      saveSite(site).then(() => flash("Saved"));
    }, 400);
    return () => clearTimeout(timer);
  }, [site]);

  const page =
    site && (site.pages.find((p) => p.id === pageId) ?? site.pages[0]);
  // Lets menu links inside the preview switch the page being edited.
  const openPageRef = useRef(null);
  // Theme and shared content reach the preview through a live store, so changing them
  // only redraws the page frame and scene, not every block (see src/site/live-site.js).
  const frame = useMemo(
    () => site && { site: frameInfo(site), content: site.content },
    [site],
  );
  const live = useRef(null);
  if (frame && !live.current) live.current = createLiveSite(frame);
  useLayoutEffect(() => {
    if (frame) live.current.set(frame);
  }, [frame]);
  const slugForMeta = page?.slug;
  const metadata = useMemo(
    () => ({
      live: live.current,
      currentSlug: slugForMeta,
      onNavigate: (slug) => openPageRef.current?.(slug),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slugForMeta, !!frame],
  );

  const hasUnpublished = () => unpublished.current;

  useEffect(() => {
    const warn = (event) => {
      if (hasUnpublished()) event.preventDefault();
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  });

  function flash(message) {
    setStatus(message);
    setTimeout(() => setStatus(""), 1500);
  }

  function openPage(id) {
    if (id === page.id) return;
    if (
      hasUnpublished() &&
      !confirm(
        "This page has changes that aren't published yet. Leave without publishing?",
      )
    )
      return;
    unpublished.current = false;
    setPageId(id);
    history.replaceState(null, "", `/admin?page=${id}`);
  }

  openPageRef.current = (slug) => {
    const target = site.pages.find((p) => p.slug === slug);
    if (target) openPage(target.id);
  };

  // Saves right away (not after the usual short delay) so "Preview" shows it at once.
  async function publish(data) {
    unpublished.current = false;
    const next = {
      ...site,
      pages: site.pages.map((p) => (p.id === page.id ? { ...p, data } : p)),
    };
    showSite(next);
    await saveSite(next);
    flash("Published");
  }

  async function startOver() {
    if (
      !confirm(
        "Delete ALL pages, theme and content changes and go back to the starting site? This can't be undone.",
      )
    )
      return;
    unpublished.current = false;
    setDialog(null);
    setPageId(null);
    const fresh = await resetSite();
    await saveSite(fresh);
    showSite(fresh);
  }

  const [tourOpen, setTourOpen] = useState(() => !hasSeenTour());

  // Everything the editor's own pieces need, read through context so the overrides below can
  // stay the same object. (Recreating them on every change made the whole editor redraw.)
  const editorState = {
    site,
    page,
    status,
    tourOpen,
    openPage,
    setDialog,
    setTourOpen,
    publish,
  };

  // Puck only gets new props when the page itself changes. Theme/content edits reach the
  // preview through the live store, so Puck doesn't redraw every block for them.
  const publishRef = useRef(null);
  publishRef.current = publish;
  const puckElement = useMemo(
    () =>
      page && (
        <Puck
          key={page.id}
          config={config}
          data={page.data}
          metadata={metadata}
          onAction={(action) => {
            if (EDIT_ACTIONS.has(action.type)) unpublished.current = true;
          }}
          onPublish={(data) => publishRef.current(data)}
          overrides={stableOverrides}
          viewports={viewports}
          ui={initialUi}
          dnd={dndSettings}
          headerTitle={page.title}
          headerPath={page.slug}
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page?.id, page?.data, page?.title, page?.slug, metadata],
  );

  if (!site) return null;

  const dialogProps = {
    site,
    onChange: setSite,
    onClose: () => setDialog(null),
  };
  return (
    <SiteContext.Provider value={site}>
      <EditorContext.Provider value={editorState}>
        {puckElement}
      </EditorContext.Provider>
      {dialog === "pages" && (
        <PagesDialog
          {...dialogProps}
          currentPageId={page.id}
          onOpenPage={openPage}
          onReset={startOver}
        />
      )}
      {dialog === "theme" && <ThemeDialog {...dialogProps} />}
      {dialog === "content" && <ContentDialog {...dialogProps} />}
      {dialog === "queue" && <CommissionsDialog {...dialogProps} />}
    </SiteContext.Provider>
  );
}
