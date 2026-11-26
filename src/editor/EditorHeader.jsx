// Buttons along the top of the editor. Every tool is one labeled click away.
import { withBase } from "../lib/base-path.js";
import { createUsePuck } from "@puckeditor/core";

export const usePuck = createUsePuck();

function ToggleButton({ active, onClick, children, tour, title }) {
  return (
    <button
      type="button"
      data-tour={tour}
      title={title}
      aria-pressed={active}
      className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const divider = (
  <span
    className="bg-base-300 mx-1 hidden h-6 w-px sm:block"
    aria-hidden="true"
  />
);

/** Pages, Theme, Content, Preview, Help: separate buttons on wide windows, one menu on narrow ones. */
function SiteTools({ page, onOpenDialog, onHelp }) {
  const items = [
    { tour: "pages", label: "Pages", onClick: () => onOpenDialog("pages") },
    { tour: "theme", label: "Theme", onClick: () => onOpenDialog("theme") },
    {
      tour: "content",
      label: "Content",
      onClick: () => onOpenDialog("content"),
    },
    {
      tour: "queue",
      label: "Queue & comms",
      onClick: () => onOpenDialog("queue"),
    },
  ];
  const closeMenu = (event) =>
    event.currentTarget.closest("details")?.removeAttribute("open");
  return (
    <>
      <div className="hidden items-center gap-1 lg:flex">
        {items.map((item) => (
          <button
            key={item.tour}
            type="button"
            data-tour={item.tour}
            className="btn btn-ghost btn-sm"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
        {divider}
        <a
          className="btn btn-ghost btn-sm"
          href={withBase(page.slug)}
          target="_blank"
          rel="noopener"
          title="Open the published page in a new tab"
        >
          Preview ↗
        </a>
        <button
          type="button"
          data-tour="help"
          className="btn btn-ghost btn-sm"
          onClick={onHelp}
        >
          ? Help
        </button>
      </div>
      <details className="dropdown dropdown-end lg:hidden">
        <summary data-tour="menu" className="btn btn-ghost btn-sm">
          <span className="sm:hidden" aria-label="Menu">
            ☰
          </span>
          <span className="hidden sm:inline">Menu ▾</span>
        </summary>
        <ul className="menu dropdown-content rounded-box border-base-300 bg-base-100 z-50 mt-2 w-44 border p-2 shadow-lg">
          {items.map((item) => (
            <li key={item.tour}>
              <button
                type="button"
                onClick={(e) => (closeMenu(e), item.onClick())}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <a
              href={withBase(page.slug)}
              target="_blank"
              rel="noopener"
              onClick={closeMenu}
            >
              Preview ↗
            </a>
          </li>
          <li>
            <button type="button" onClick={(e) => (closeMenu(e), onHelp())}>
              ? Help
            </button>
          </li>
        </ul>
      </details>
    </>
  );
}

/** Replaces Puck's own header with one row of clearly labeled tools. It adapts to narrow windows. */
export function EditorHeader({
  site,
  page,
  status,
  onOpenPage,
  onOpenDialog,
  onHelp,
  onPublish,
}) {
  const ui = usePuck((s) => s.appState.ui);
  const data = usePuck((s) => s.appState.data);
  const dispatch = usePuck((s) => s.dispatch);
  const history = usePuck((s) => s.history);
  const toggle = (key) =>
    dispatch({ type: "setUi", ui: (prev) => ({ [key]: !prev[key] }) });

  return (
    <header className="border-base-300 bg-base-100 flex flex-nowrap items-center gap-1.5 border-b px-2 py-2 font-sans sm:gap-2 sm:px-4">
      <span className="text-primary mr-1 hidden font-extrabold xl:inline">
        {site.name}
      </span>
      <label className="sr-only" htmlFor="page-select">
        Page being edited
      </label>
      <select
        id="page-select"
        data-tour="page-select"
        className="select select-sm w-24 shrink sm:w-40"
        value={page.id}
        onChange={(e) => onOpenPage(e.target.value)}
      >
        {site.pages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
      {divider}
      <ToggleButton
        tour="add-blocks"
        active={ui.leftSideBarVisible}
        onClick={() => toggle("leftSideBarVisible")}
        title="Show or hide the block library"
      >
        +<span className="hidden sm:inline">&nbsp;Add</span>
        <span className="hidden lg:inline">&nbsp;blocks</span>
      </ToggleButton>
      <ToggleButton
        tour="settings"
        active={ui.rightSideBarVisible}
        onClick={() => toggle("rightSideBarVisible")}
        title="Show or hide settings for the selected block"
      >
        <span className="sm:hidden" aria-hidden="true">
          ⚙
        </span>
        <span className="hidden lg:inline">Block&nbsp;</span>
        <span className="hidden sm:inline">Settings</span>
      </ToggleButton>
      <span data-tour="undo" className="hidden gap-1 sm:flex">
        <button
          type="button"
          className="btn btn-square btn-ghost btn-sm"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
          disabled={!history.hasPast}
          onClick={history.back}
        >
          ↶
        </button>
        <button
          type="button"
          className="btn btn-square btn-ghost btn-sm"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!history.hasFuture}
          onClick={history.forward}
        >
          ↷
        </button>
      </span>

      <span className="flex-1" />

      <SiteTools page={page} onOpenDialog={onOpenDialog} onHelp={onHelp} />
      {status && (
        <span className="text-success hidden text-sm sm:inline" role="status">
          {status}
        </span>
      )}
      <button
        type="button"
        data-tour="publish"
        className="btn btn-sm btn-primary shrink-0"
        onClick={() => onPublish(data)}
      >
        Publish
      </button>
    </header>
  );
}
