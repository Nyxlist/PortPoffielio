// Add, rename, reorder, hide from the menu, and delete pages.
import { useState } from "react";
import { Dialog } from "./Dialog.jsx";
import { pageTemplates } from "../data/templates.js";
import { slugify } from "../services/site-store.js";

function newPage(title, slug, siteName, templateId) {
  const template =
    pageTemplates.find((t) => t.id === templateId) ?? pageTemplates[0];
  return {
    id: crypto.randomUUID(),
    title,
    slug,
    inNav: true,
    data: {
      root: { props: { title: `${title} — ${siteName}`, description: "" } },
      content: template.build(title),
    },
  };
}

export function PagesDialog({
  site,
  currentPageId,
  onChange,
  onOpenPage,
  onReset,
  onClose,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState("blank");
  const pages = site.pages;
  const setPages = (next) => onChange((s) => ({ ...s, pages: next }));
  const updatePage = (id, patch) =>
    setPages(pages.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const slugTaken = (slug, exceptId) =>
    pages.some((p) => p.slug === slug && p.id !== exceptId);

  function uniqueSlug(title) {
    const base = slugify(title);
    let slug = base;
    for (let n = 2; slugTaken(slug); n++) slug = `${base}-${n}`;
    return slug;
  }

  function add(event) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const page = newPage(title, uniqueSlug(title), site.name, newTemplate);
    setPages([...pages, page]);
    setNewTitle("");
    onOpenPage(page.id);
  }

  function setSlug(page, raw) {
    const slug = slugify(raw.replace(/^\//, ""));
    if (slugTaken(slug, page.id))
      return alert(`Another page already uses ${slug}.`);
    updatePage(page.id, { slug });
  }

  function move(index, step) {
    const target = index + step;
    if (target < 1 || target >= pages.length) return; // the home page stays first
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    setPages(next);
  }

  function remove(page) {
    if (!confirm(`Delete the "${page.title}" page? This can't be undone.`))
      return;
    setPages(pages.filter((p) => p.id !== page.id));
    if (page.id === currentPageId) onOpenPage(pages[0].id);
  }

  return (
    <Dialog title="Pages" onClose={onClose} wide>
      <p className="mb-4 text-sm opacity-70">
        The order here is the order in the menu. The home page is always first
        and reached by clicking the site name.
      </p>
      <ul className="space-y-2">
        {pages.map((page, index) => {
          const isHome = page.slug === "/";
          return (
            <li
              key={page.id}
              className={`rounded-box grid gap-2 border p-3 ${page.id === currentPageId ? "border-primary" : "border-base-300"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className="input input-sm min-w-40 flex-1"
                  aria-label="Page name"
                  value={page.title}
                  onChange={(e) =>
                    updatePage(page.id, { title: e.target.value })
                  }
                />
                {isHome ? (
                  <span className="px-2 text-sm opacity-60">/ (home)</span>
                ) : (
                  <input
                    key={page.slug}
                    className="input input-sm w-36"
                    aria-label="Page address"
                    defaultValue={page.slug}
                    onBlur={(e) =>
                      e.target.value !== page.slug &&
                      setSlug(page, e.target.value)
                    }
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!isHome && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={page.inNav}
                      onChange={(e) =>
                        updatePage(page.id, { inNav: e.target.checked })
                      }
                    />
                    Show in menu
                  </label>
                )}
                <span className="flex-1" />
                {!isHome && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      aria-label="Move up"
                      onClick={() => move(index, -1)}
                      disabled={index <= 1}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      aria-label="Move down"
                      onClick={() => move(index, 1)}
                      disabled={index === pages.length - 1}
                    >
                      ↓
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => onOpenPage(page.id)}
                  disabled={page.id === currentPageId}
                >
                  Edit
                </button>
                {!isHome && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => remove(page)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
        <input
          className="input input-sm min-w-40 flex-1"
          placeholder="New page name"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select
          className="select select-sm w-40"
          aria-label="Start from"
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
        >
          {pageTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              Start: {t.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" disabled={!newTitle.trim()}>
          Add page
        </button>
      </form>

      <div className="border-base-300 mt-8 border-t pt-4">
        <button
          type="button"
          className="btn btn-ghost btn-xs text-error"
          onClick={onReset}
        >
          Start over (delete all changes)…
        </button>
      </div>
    </Dialog>
  );
}
