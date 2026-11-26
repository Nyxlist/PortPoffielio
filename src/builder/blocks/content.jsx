// Content blocks. Schedule, updates, fanart and social links come from the shared
// lists in the "Content" panel, so editing them once updates every page that shows them.
import { useState } from "react";
import { useSiteContent } from "../../site/live-site.js";
import { safeImageUrl, safeUrl } from "../../lib/safe-url.js";
import {
  buttonSizeClass,
  buttonStyleClass,
  columnCountOptions,
  gridColsClass,
  sizeOptions,
  yesNo,
} from "../options.js";

const cx = (...classes) => classes.filter(Boolean).join(" ");
// Shared lists come from the live site store, so blocks update when Content changes.
const useContent = (puck) => useSiteContent(puck);
const limitField = {
  type: "number",
  label: "How many to show (0 = all)",
  min: 0,
};
const take = (items = [], limit) => (limit > 0 ? items.slice(0, limit) : items);
const columnsField = {
  type: "select",
  label: "Columns on big screens",
  options: columnCountOptions,
};

function Empty({ children }) {
  return (
    <p className="rounded-box bg-base-200 text-base-content col-span-full w-full p-6 text-center opacity-70">
      {children}
    </p>
  );
}

export const StreamSchedule = {
  label: "Stream schedule",
  fields: { limit: limitField, columns: columnsField },
  defaultProps: { limit: 0, columns: 3 },
  render: ({ limit, columns, puck }) => {
    const items = take(useContent(puck).schedule, limit);
    if (!items.length) return <Empty>No streams scheduled right now.</Empty>;
    return (
      <div
        className={cx("grid w-full gap-4 text-left", gridColsClass[columns])}
      >
        {items.map((s, i) => (
          <article key={i} className="card bg-base-200 text-base-content p-6">
            <p className="text-primary text-sm font-bold">
              {s.day} · {s.time}
            </p>
            <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
            <p className="text-sm opacity-70">{s.topic}</p>
          </article>
        ))}
      </div>
    );
  },
};

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const formatDate = (iso) =>
  iso && !Number.isNaN(Date.parse(iso)) ? dateFormat.format(new Date(iso)) : "";

export const Updates = {
  label: "Updates",
  fields: { limit: limitField },
  defaultProps: { limit: 0 },
  render: ({ limit, puck }) => {
    const sorted = [...(useContent(puck).updates ?? [])].sort((a, b) =>
      (b.date ?? "").localeCompare(a.date ?? ""),
    );
    const items = take(sorted, limit);
    if (!items.length) return <Empty>No updates yet.</Empty>;
    return (
      <div className="flex w-full flex-col gap-4 text-left">
        {items.map((u, i) => (
          <article key={i} className="card border-base-300 border p-6">
            <div className="flex flex-wrap items-center gap-3">
              {u.tag && <span className="badge badge-accent">{u.tag}</span>}
              <time dateTime={u.date} className="text-sm opacity-60">
                {formatDate(u.date)}
              </time>
            </div>
            <h3 className="mt-3 text-xl font-bold">{u.title}</h3>
            <p className="mt-2 leading-relaxed whitespace-pre-line opacity-80">
              {u.body}
            </p>
          </article>
        ))}
      </div>
    );
  },
};

function FanartGrid({ items, columns, showFilter }) {
  const [tag, setTag] = useState("");
  const tags = [...new Set(items.flatMap((art) => splitTags(art.tags)))].sort();
  const visible = tag
    ? items.filter((art) => splitTags(art.tags).includes(tag))
    : items;
  return (
    <div className="flex w-full flex-col gap-6 text-left">
      {showFilter && tags.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by tag"
        >
          {["", ...tags].map((t) => (
            <button
              key={t || "all"}
              type="button"
              className={cx("btn btn-sm", tag === t && "btn-primary")}
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
            >
              {t || "All"}
            </button>
          ))}
        </div>
      )}
      <div className={cx("grid gap-4", gridColsClass[columns])}>
        {visible.map((art, i) => {
          const src = safeImageUrl(art.image);
          return (
            <figure key={i} className="space-y-2">
              {src ? (
                <img
                  src={src}
                  alt={art.caption || `Fanart by ${art.artist}`}
                  loading="lazy"
                  className="rounded-box aspect-square w-full object-cover"
                />
              ) : (
                <div className="rounded-box bg-base-200 aspect-square" />
              )}
              <figcaption className="text-sm opacity-70">
                by{" "}
                <a
                  href={safeUrl(art.artistUrl)}
                  className="link link-hover"
                  target="_blank"
                  rel="noopener"
                >
                  {art.artist}
                </a>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
const splitTags = (tags) =>
  (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export const FanartGallery = {
  label: "Fanart gallery",
  fields: {
    limit: limitField,
    columns: columnsField,
    showFilter: { type: "radio", label: "Show tag filter", options: yesNo },
  },
  defaultProps: { limit: 0, columns: 4, showFilter: true },
  render: ({ limit, columns, showFilter, puck }) => {
    const items = take(useContent(puck).fanart, limit);
    if (!items.length) return <Empty>No fanart yet.</Empty>;
    return (
      <FanartGrid items={items} columns={columns} showFilter={showFilter} />
    );
  },
};

export const SocialLinks = {
  label: "Social links",
  fields: {
    which: {
      type: "radio",
      label: "Which accounts",
      options: [
        { label: "Featured only", value: "featured" },
        { label: "All", value: "all" },
      ],
    },
    layout: {
      type: "radio",
      label: "Layout",
      options: [
        { label: "Row", value: "row" },
        { label: "Full-width list", value: "list" },
      ],
    },
    size: { type: "select", label: "Size", options: sizeOptions },
  },
  defaultProps: { which: "featured", layout: "row", size: "md" },
  render: ({ which, layout, size, puck }) => {
    const socials = (useContent(puck).socials ?? []).filter(
      (s) => which === "all" || s.featured,
    );
    if (!socials.length) return <Empty>No social links yet.</Empty>;
    return (
      <div
        className={cx(
          "flex w-full gap-3",
          layout === "list" ? "flex-col" : "flex-wrap",
        )}
      >
        {socials.map((s, i) => (
          <a
            key={i}
            href={safeUrl(s.url)}
            className={cx(
              "btn",
              buttonStyleClass[s.style] ?? "btn-outline",
              buttonSizeClass[size],
              layout === "list" && "btn-block",
            )}
            target="_blank"
            rel="noopener"
          >
            {s.name}
          </a>
        ))}
      </div>
    );
  },
};
