// Shared lists used by the content blocks: schedule, updates, fanart, social links.
import { useState } from "react";
import { Dialog } from "./Dialog.jsx";
import { ListEditor } from "./ListEditor.jsx";

const buttonStyles = [
  { label: "Main color", value: "primary" },
  { label: "Second color", value: "secondary" },
  { label: "Accent color", value: "accent" },
  { label: "Outline", value: "outline" },
];

const lists = {
  schedule: {
    tab: "Stream schedule",
    addLabel: "Add stream",
    fields: [
      { key: "day", label: "Day" },
      { key: "time", label: "Time" },
      { key: "title", label: "Title" },
      { key: "topic", label: "Game or topic" },
    ],
    newItem: () => ({
      day: "Day",
      time: "20:00",
      title: "Stream title",
      topic: "",
    }),
    summary: (s) => `${s.day} · ${s.time} — ${s.title}`,
  },
  updates: {
    tab: "Updates",
    addLabel: "Add update",
    fields: [
      { key: "date", label: "Date", type: "date" },
      { key: "tag", label: "Tag (e.g. News, Event)" },
      { key: "title", label: "Title" },
      { key: "body", label: "Text", type: "textarea" },
    ],
    newItem: () => ({
      date: new Date().toISOString().slice(0, 10),
      tag: "News",
      title: "New update",
      body: "",
    }),
    summary: (u) => `${u.date} — ${u.title}`,
  },
  fanart: {
    tab: "Fanart",
    addLabel: "Add fanart",
    fields: [
      { key: "image", label: "Artwork", type: "image" },
      { key: "artist", label: "Artist name (always credit them)" },
      { key: "artistUrl", label: "Link to the artist", type: "url" },
      { key: "caption", label: "Description (for screen readers)" },
      { key: "tags", label: "Tags, separated by commas" },
    ],
    newItem: () => ({
      image: "",
      artist: "@artist",
      artistUrl: "",
      caption: "",
      tags: "",
    }),
    summary: (f) => `${f.artist}${f.tags ? ` (${f.tags})` : ""}`,
  },
  socials: {
    tab: "Social links",
    addLabel: "Add account",
    fields: [
      { key: "name", label: "Name (e.g. YouTube)" },
      { key: "url", label: "Link", type: "url" },
      {
        key: "style",
        label: "Button style",
        type: "select",
        options: buttonStyles,
      },
      {
        key: "featured",
        label: "Featured (shown in short link rows)",
        type: "checkbox",
      },
    ],
    newItem: () => ({
      name: "New account",
      url: "https://",
      style: "outline",
      featured: false,
    }),
    summary: (s) => s.name,
  },
};

export function ContentDialog({ site, onChange, onClose }) {
  const [tab, setTab] = useState("schedule");
  const list = lists[tab];
  const setItems = (items) =>
    onChange((s) => ({ ...s, content: { ...s.content, [tab]: items } }));

  return (
    <Dialog title="Content" onClose={onClose} wide>
      <p className="mb-4 text-sm opacity-70">
        These lists are shared: change them here and every page that shows them
        updates.
      </p>
      <div role="tablist" className="tabs-box tabs mb-4">
        {Object.entries(lists).map(([key, { tab: label }]) => (
          <button
            key={key}
            role="tab"
            type="button"
            className={`tab ${tab === key ? "tab-active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <ListEditor
        key={tab}
        items={site.content[tab] ?? []}
        onChange={setItems}
        {...list}
      />
    </Dialog>
  );
}
