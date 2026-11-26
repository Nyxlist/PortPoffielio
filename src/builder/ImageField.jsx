import { useState } from "react";
import { fileToResizedDataUrl } from "../lib/image.js";
import { safeImageUrl } from "../lib/safe-url.js";

/** Editor field for images: upload from the computer, or paste a web link. */
export function imageField(label = "Image") {
  return {
    type: "custom",
    label,
    render: ({ name, value, onChange, readOnly }) => (
      <ImageInput
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    ),
  };
}

export function ImageInput({
  name,
  label,
  value,
  onChange,
  readOnly,
  maxSize,
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const src = safeImageUrl(value);

  const [over, setOver] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    await takeFile(file);
  }

  /** Drag a picture file (or a picture from another tab) onto the box, or paste one. */
  async function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setOver(false);
    if (readOnly) return;
    const file = [...(event.dataTransfer?.files ?? [])].find((f) =>
      f.type.startsWith("image/"),
    );
    if (file) return takeFile(file);
    const link = event.dataTransfer?.getData("text/uri-list")?.split("\n")[0];
    if (link && /^https?:/i.test(link)) onChange(link.trim());
  }
  function onPaste(event) {
    const file = [...(event.clipboardData?.files ?? [])].find((f) =>
      f.type.startsWith("image/"),
    );
    if (!file || readOnly) return;
    event.preventDefault();
    takeFile(file);
  }

  async function takeFile(file) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await fileToResizedDataUrl(file, maxSize));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 8,
          padding: 8,
          borderRadius: 8,
          border: `2px dashed ${over ? "#2563eb" : "#d4d4d8"}`,
          background: over ? "#eff6ff" : undefined,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        tabIndex={0}
      >
        {!src && (
          <div style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}>
            Drop a picture here, paste one (Ctrl+V), or choose a file
          </div>
        )}
        {src && (
          <img
            src={src}
            alt=""
            style={{
              width: "100%",
              maxHeight: 160,
              objectFit: "contain",
              borderRadius: 8,
              background: "#f4f4f5",
            }}
          />
        )}
        <label style={{ display: "grid", gap: 4, fontSize: 13, minWidth: 0 }}>
          <span>
            {busy ? "Uploading…" : src ? "Replace image" : "Upload image"}
          </span>
          <input
            id={name}
            type="file"
            style={{ width: "100%", minWidth: 0 }}
            accept="image/*"
            onChange={upload}
            disabled={readOnly || busy}
          />
        </label>
        <input
          type="url"
          placeholder="…or paste an image link"
          value={value?.startsWith("data:") ? "" : (value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "6px 8px",
            border: "1px solid #d4d4d8",
            borderRadius: 6,
            fontSize: 13,
          }}
        />
        {src && !readOnly && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              justifySelf: "start",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            Remove image
          </button>
        )}
        {error && <p style={{ color: "#b91c1c", fontSize: 13 }}>{error}</p>}
      </div>
    </div>
  );
}
