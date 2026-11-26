// List blocks whose items are typed straight into the block (facts, FAQ, videos, tags).
import { imageField } from "../ImageField.jsx";
import { safeImageUrl, safeUrl } from "../../lib/safe-url.js";
import {
  badgeSizeClass,
  badgeStyleClass,
  badgeStyleOptions,
  columnCountOptions,
  gridColsClass,
  sizeOptions,
} from "../options.js";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export const Facts = {
  label: "Facts",
  fields: {
    facts: {
      type: "array",
      label: "Facts",
      arrayFields: {
        label: { type: "text", label: "Label" },
        value: { type: "text", label: "Value" },
      },
      defaultItemProps: { label: "Label", value: "—" },
      getItemSummary: (item) => item.label || "Fact",
    },
    style: {
      type: "radio",
      label: "Style",
      options: [
        { label: "Tiles", value: "tiles" },
        { label: "Compact list", value: "list" },
      ],
    },
    columns: {
      type: "select",
      label: "Columns (tiles)",
      options: columnCountOptions,
    },
  },
  defaultProps: {
    facts: [{ label: "Birthday", value: "—" }],
    style: "tiles",
    columns: 3,
  },
  render: ({ facts, style, columns }) =>
    style === "list" ? (
      <ul className="card bg-base-200 text-base-content w-full space-y-2 p-6 text-left text-sm">
        {facts.map((f, i) => (
          <li key={i}>
            <span className="font-bold">{f.label}:</span> {f.value}
          </li>
        ))}
      </ul>
    ) : (
      <dl
        className={cx(
          "grid w-full gap-4 text-left",
          columns === 1 ? "grid-cols-1" : "grid-cols-2",
          { 3: "md:grid-cols-3", 4: "md:grid-cols-4" }[columns],
        )}
      >
        {facts.map((f, i) => (
          <div
            key={i}
            className="rounded-box bg-base-200 text-base-content p-5"
          >
            <dt className="text-sm opacity-70">{f.label}</dt>
            <dd className="mt-1 text-lg font-bold">{f.value}</dd>
          </div>
        ))}
      </dl>
    ),
};

export const BadgeList = {
  label: "Tag list",
  fields: {
    items: {
      type: "array",
      label: "Tags",
      arrayFields: { label: { type: "text", label: "Text" } },
      defaultItemProps: { label: "Tag" },
      getItemSummary: (item) => item.label || "Tag",
    },
    style: { type: "select", label: "Style", options: badgeStyleOptions },
    size: { type: "select", label: "Size", options: sizeOptions },
  },
  defaultProps: { items: [{ label: "Tag" }], style: "secondary", size: "lg" },
  render: ({ items, style, size }) => (
    <ul className="flex w-full flex-wrap gap-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={cx("badge", badgeStyleClass[style], badgeSizeClass[size])}
        >
          {item.label}
        </li>
      ))}
    </ul>
  ),
};

export const FAQ = {
  label: "FAQ",
  fields: {
    items: {
      type: "array",
      label: "Questions",
      arrayFields: {
        question: { type: "text", label: "Question" },
        answer: { type: "textarea", label: "Answer" },
      },
      defaultItemProps: { question: "Question?", answer: "Answer." },
      getItemSummary: (item) => item.question || "Question",
    },
  },
  defaultProps: { items: [{ question: "Question?", answer: "Answer." }] },
  render: ({ items }) => (
    <div className="flex w-full flex-col gap-3 text-left">
      {items.map((item, i) => (
        <details
          key={i}
          className="collapse-arrow bg-base-200 text-base-content collapse"
        >
          <summary className="collapse-title font-bold">
            {item.question}
          </summary>
          <p className="collapse-content leading-relaxed whitespace-pre-line opacity-80">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  ),
};

export const VideoGrid = {
  label: "Videos",
  fields: {
    videos: {
      type: "array",
      label: "Videos",
      arrayFields: {
        title: { type: "text", label: "Title" },
        url: { type: "text", label: "Link" },
        kind: { type: "text", label: "Label (e.g. Clip, VOD)" },
        thumbnail: imageField("Thumbnail"),
      },
      defaultItemProps: {
        title: "Video title",
        url: "#",
        kind: "Clip",
        thumbnail: "",
      },
      getItemSummary: (item) => item.title || "Video",
    },
    columns: {
      type: "select",
      label: "Columns on big screens",
      options: columnCountOptions,
    },
  },
  defaultProps: {
    videos: [{ title: "Video title", url: "#", kind: "Clip", thumbnail: "" }],
    columns: 3,
  },
  render: ({ videos, columns }) => (
    <div className={cx("grid w-full gap-6 text-left", gridColsClass[columns])}>
      {videos.map((v, i) => {
        const src = safeImageUrl(v.thumbnail);
        return (
          <a
            key={i}
            href={safeUrl(v.url)}
            className="group space-y-3"
            target="_blank"
            rel="noopener"
          >
            {src ? (
              <img
                src={src}
                alt=""
                loading="lazy"
                className="rounded-box aspect-video w-full object-cover"
              />
            ) : (
              <div className="rounded-box bg-base-200 text-base-content/50 flex aspect-video items-center justify-center text-sm">
                Thumbnail
              </div>
            )}
            {v.kind && (
              <span className="badge badge-sm badge-secondary">{v.kind}</span>
            )}
            <h3 className="group-hover:text-primary font-bold">{v.title}</h3>
          </a>
        );
      })}
    </div>
  ),
};
