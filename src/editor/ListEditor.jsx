// Edits a list of items (e.g. stream schedule entries): add, remove, reorder, and change fields.
import { useState } from "react";
import { fileToResizedDataUrl } from "../lib/image.js";
import { safeImageUrl } from "../lib/safe-url.js";

/**
 * fields: [{ key, label, type: "text" | "textarea" | "date" | "url" | "checkbox" | "select" | "image", options? }]
 */
export function ListEditor({
  items,
  onChange,
  fields,
  newItem,
  summary,
  addLabel = "Add item",
}) {
  const [openIndex, setOpenIndex] = useState(null);

  const update = (index, key, value) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  const remove = (index) => {
    if (!confirm(`Remove "${summary(items[index])}"?`)) return;
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(null);
  };
  const move = (index, step) => {
    const target = index + step;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpenIndex(target);
  };
  const add = () => {
    onChange([...items, newItem()]);
    setOpenIndex(items.length);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="rounded-box border-base-300 border">
          <div className="flex items-center gap-1 p-2">
            <button
              type="button"
              className="flex-1 truncate px-2 text-left font-semibold"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {summary(item) || "Untitled"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              aria-label="Move up"
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              aria-label="Move down"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-error"
              onClick={() => remove(index)}
            >
              Remove
            </button>
          </div>
          {openIndex === index && (
            <div className="border-base-300 grid gap-3 border-t p-4">
              {fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={item[field.key]}
                  onChange={(value) => update(index, field.key, value)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={add}>
        + {addLabel}
      </button>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const { label, type } = field;
  if (type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    );
  }
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {type === "textarea" ? (
        <textarea
          className="textarea w-full"
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === "select" ? (
        <select
          className="select w-full"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : type === "image" ? (
        <ImageInput value={value} onChange={onChange} />
      ) : (
        <input
          className="input w-full"
          type={type ?? "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ImageInput({ value, onChange }) {
  const [error, setError] = useState("");
  const src = safeImageUrl(value);
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      onChange(await fileToResizedDataUrl(file));
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <span className="grid gap-2">
      {src && (
        <img src={src} alt="" className="rounded-box h-28 w-28 object-cover" />
      )}
      <input
        type="file"
        accept="image/*"
        className="file-input file-input-sm w-full"
        onChange={upload}
      />
      {src && (
        <button
          type="button"
          className="btn btn-ghost btn-xs justify-self-start"
          onClick={() => onChange("")}
        >
          Remove image
        </button>
      )}
      {error && <span className="text-error">{error}</span>}
    </span>
  );
}
