// The Image block: upload, crop (frame + focus point + zoom), size, fun shapes, and effects.
import { ImageInput } from "../ImageField.jsx";
import { Control, Segmented, Slider } from "../style/controls.jsx";
import { safeImageUrl, safeUrl } from "../../lib/safe-url.js";
import {
  BlendLayer,
  blendField,
  defaultBlend,
  defaultMask,
  maskCss,
  maskField,
} from "./image-mask.jsx";

const frames = {
  original: undefined,
  square: "1 / 1",
  landscape: "4 / 3",
  wide: "16 / 9",
  portrait: "3 / 4",
  tall: "9 / 16",
};

const svgMask = (path) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${path}'/></svg>`,
  )}")`;

const masked = (path) => {
  const mask = svgMask(path);
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
  };
};

/** Each shape is plain CSS, so it works the same in the editor and on the site. */
const shapes = {
  rectangle: { label: "Rectangle", css: {} },
  rounded: { label: "Rounded", css: { borderRadius: "var(--radius-box)" } },
  circle: { label: "Circle", css: { borderRadius: "9999px" } },
  arch: {
    label: "Arch",
    css: { borderRadius: "9999px 9999px var(--radius-box) var(--radius-box)" },
  },
  hexagon: {
    label: "Hexagon",
    css: {
      clipPath: "polygon(25% 2%, 75% 2%, 100% 50%, 75% 98%, 25% 98%, 0 50%)",
    },
  },
  star: {
    label: "Star",
    css: {
      clipPath:
        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    },
  },
  heart: {
    label: "Heart",
    css: masked(
      "M50 92 C20 70 2 52 2 30 C2 14 14 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C86 4 98 14 98 30 C98 52 80 70 50 92Z",
    ),
  },
  blob: {
    label: "Blob",
    css: masked(
      "M54 3 C74 5 95 18 97 42 C99 64 86 92 60 97 C35 102 9 88 4 64 C-1 40 12 14 34 6 C40 4 47 2 54 3Z",
    ),
  },
};

const defaultPicture = { src: "", x: 50, y: 50, zoom: 1 };
const defaultEffects = {
  brightness: 100,
  saturation: 100,
  blur: 0,
  grayscale: false,
};

/** Upload + crop in one place: click the preview to choose what stays in view, then zoom. */
const pictureField = {
  type: "custom",
  label: "Picture",
  render: ({ value, onChange, readOnly }) => {
    const p = { ...defaultPicture, ...value };
    const pickFocus = (event) => {
      const box = event.currentTarget.getBoundingClientRect();
      const x = Math.round(((event.clientX - box.left) / box.width) * 100);
      const y = Math.round(((event.clientY - box.top) / box.height) * 100);
      onChange({ ...p, x, y });
    };
    const src = safeImageUrl(p.src);
    return (
      <div>
        <ImageInput
          name="picture"
          label="Picture"
          value={p.src}
          onChange={(v) => onChange({ ...p, src: v })}
          readOnly={readOnly}
        />
        {src && !readOnly && (
          <div style={{ marginTop: 12 }}>
            <Control title="Crop: click the part that should stay in view">
              <div
                onClick={pickFocus}
                style={{
                  position: "relative",
                  cursor: "crosshair",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{ width: "100%", display: "block" }}
                  draggable={false}
                />
                <span
                  style={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: 18,
                    height: 18,
                    transform: "translate(-50%, -50%)",
                    borderRadius: 999,
                    border: "3px solid #fff",
                    boxShadow: "0 0 0 2px #2563eb",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </Control>
            <Control title="Zoom in">
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={p.zoom}
                onChange={(zoom) => onChange({ ...p, zoom })}
                suffix="×"
              />
            </Control>
          </div>
        )}
      </div>
    );
  },
};

const sizeField = {
  type: "custom",
  label: "Size",
  render: ({ value, onChange }) => (
    <Control title="Size (width)">
      <Slider
        min={10}
        max={100}
        step={5}
        value={value ?? 100}
        onChange={onChange}
        suffix="%"
      />
    </Control>
  ),
};

const effectsField = {
  type: "custom",
  label: "Effects",
  render: ({ value, onChange }) => {
    const e = { ...defaultEffects, ...value };
    const set = (key) => (v) => onChange({ ...e, [key]: v });
    return (
      <div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            display: "block",
            marginBottom: 8,
          }}
        >
          Effects
        </span>
        <Control title="Brightness">
          <Slider
            min={40}
            max={160}
            step={5}
            value={e.brightness}
            onChange={set("brightness")}
            suffix="%"
          />
        </Control>
        <Control title="Color strength">
          <Slider
            min={0}
            max={200}
            step={10}
            value={e.saturation}
            onChange={set("saturation")}
            suffix="%"
          />
        </Control>
        <Control title="Blur">
          <Slider
            min={0}
            max={10}
            value={e.blur}
            onChange={set("blur")}
            suffix="px"
          />
        </Control>
        <Control title="Contrast">
          <Slider
            min={40}
            max={200}
            step={5}
            value={e.contrast ?? 100}
            onChange={set("contrast")}
            suffix="%"
          />
        </Control>
        <Control title="Shift colors (hue)">
          <Slider
            min={0}
            max={360}
            step={10}
            value={e.hue ?? 0}
            onChange={set("hue")}
            suffix="°"
          />
        </Control>
        <Control title="Mirror">
          <Segmented
            options={[
              { label: "None", value: "" },
              { label: "Left ↔ right", value: "x" },
              { label: "Upside down", value: "y" },
            ]}
            value={e.flip ?? ""}
            onChange={set("flip")}
          />
        </Control>
        <Control title="Black & white">
          <Segmented
            options={[
              { label: "Off", value: false },
              { label: "On", value: true },
            ]}
            value={e.grayscale}
            onChange={set("grayscale")}
          />
        </Control>
      </div>
    );
  },
};

export const Image = {
  label: "Image",
  fields: {
    picture: pictureField,
    alt: { type: "text", label: "Description (for screen readers)" },
    size: sizeField,
    align: {
      type: "radio",
      label: "Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    frame: {
      type: "select",
      label: "Frame (crop to)",
      options: [
        { label: "Original shape", value: "original" },
        { label: "Square (1:1)", value: "square" },
        { label: "Landscape (4:3)", value: "landscape" },
        { label: "Wide (16:9)", value: "wide" },
        { label: "Portrait (3:4)", value: "portrait" },
        { label: "Tall (9:16)", value: "tall" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      options: Object.entries(shapes).map(([value, { label }]) => ({
        label,
        value,
      })),
    },
    fit: {
      type: "radio",
      label: "Fit",
      options: [
        { label: "Fill the frame", value: "cover" },
        { label: "Show whole picture", value: "contain" },
      ],
    },
    effects: effectsField,
    mask: maskField,
    blend: blendField,
    link: { type: "text", label: "Link when clicked (optional)" },
  },
  defaultProps: {
    picture: defaultPicture,
    alt: "",
    size: 100,
    align: "center",
    frame: "square",
    shape: "rounded",
    fit: "cover",
    effects: defaultEffects,
    mask: defaultMask,
    blend: defaultBlend,
    link: "",
  },
  render: ({
    picture,
    alt,
    size,
    align,
    frame,
    shape,
    fit,
    effects,
    mask,
    blend,
    link,
  }) => {
    const p = { ...defaultPicture, ...picture };
    const e = { ...defaultEffects, ...effects };
    const src = safeImageUrl(p.src);
    const aspectRatio = frames[frame] ?? (src ? undefined : "1 / 1");
    const box = {
      width: `${size ?? 100}%`,
      marginLeft: align === "left" ? 0 : "auto",
      marginRight: align === "right" ? 0 : "auto",
      aspectRatio,
      overflow: "hidden",
      position: "relative",
      isolation: "isolate",
      ...(shapes[shape] ?? shapes.rectangle).css,
      ...maskCss(mask),
    };
    const filter = [
      e.brightness !== 100 && `brightness(${e.brightness}%)`,
      e.saturation !== 100 && `saturate(${e.saturation}%)`,
      e.blur > 0 && `blur(${e.blur}px)`,
      e.grayscale && "grayscale(1)",
      e.contrast && e.contrast !== 100 && `contrast(${e.contrast}%)`,
      e.hue && `hue-rotate(${e.hue}deg)`,
    ]
      .filter(Boolean)
      .join(" ");

    const content = src ? (
      <div style={box}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: aspectRatio ? "100%" : "auto",
            objectFit: fit === "contain" ? "contain" : "cover",
            objectPosition: `${p.x}% ${p.y}%`,
            transform:
              [
                p.zoom > 1 && `scale(${p.zoom})`,
                e.flip === "x" && "scaleX(-1)",
                e.flip === "y" && "scaleY(-1)",
              ]
                .filter(Boolean)
                .join(" ") || undefined,
            transformOrigin: `${p.x}% ${p.y}%`,
            filter: filter || undefined,
          }}
        />
        <BlendLayer blend={blend} />
      </div>
    ) : (
      <div
        style={box}
        className="bg-base-200 text-base-content/50 flex items-center justify-center text-sm"
      >
        {alt || "Image"}
      </div>
    );

    const href = link ? safeUrl(link) : "";
    if (!href || href === "#") return content;
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className="block"
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
      >
        {content}
      </a>
    );
  },
};
