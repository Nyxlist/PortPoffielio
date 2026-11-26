// Basic blocks: text, buttons, images, badges.
import { safeUrl } from "../../lib/safe-url.js";
import {
  badgeSizeClass,
  badgeStyleClass,
  badgeStyleOptions,
  buttonSizeClass,
  buttonStyleClass,
  buttonStyleOptions,
  headingSizeClass,
  headingSizeOptions,
  justifyClass,
  sizeOptions,
  textColorClass,
  textColorOptions,
  textSizeClass,
  textSizeOptions,
  yesNo,
} from "../options.js";

const cx = (...classes) => classes.filter(Boolean).join(" ");
const alignField = {
  type: "select",
  label: "Align",
  options: [
    { label: "Same as section", value: "auto" },
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ],
};
const ownAlignClass = {
  auto: "",
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Headings are one piece of rich text. Selecting words and pressing "Highlight" shows them
// in the main color (saved as bold, which is styled with the theme color).
const headingTextOptions = {
  bold: {},
  italic: false,
  underline: false,
  strike: false,
  code: false,
  codeBlock: false,
  link: false,
  heading: false,
  blockquote: false,
  bulletList: false,
  orderedList: false,
  listItem: false,
  listKeymap: false,
  horizontalRule: false,
  hardBreak: false,
  textAlign: false,
};

function HighlightMenu({ editor, readOnly }) {
  const active = editor?.isActive("bold");
  return (
    <button
      type="button"
      disabled={readOnly || !editor}
      aria-pressed={!!active}
      title="Show the selected words in your main color"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => editor?.chain().focus().toggleBold().run()}
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        background: active ? "#e86fa5" : "transparent",
        color: active ? "#fff" : "inherit",
        border: "1px solid #d4d4d8",
      }}
    >
      Highlight
    </button>
  );
}

export const Heading = {
  label: "Heading",
  fields: {
    text: {
      type: "richtext",
      label: "Text (select words, then press Highlight to color them)",
      contentEditable: true,
      options: headingTextOptions,
      renderMenu: HighlightMenu,
      renderInlineMenu: HighlightMenu,
    },
    level: {
      type: "select",
      label: "Heading level (for search engines)",
      options: [
        { label: "Page title (H1)", value: "h1" },
        { label: "Section title (H2)", value: "h2" },
        { label: "Small title (H3)", value: "h3" },
      ],
    },
    size: { type: "select", label: "Size", options: headingSizeOptions },
    color: { type: "select", label: "Color", options: textColorOptions },
    align: alignField,
  },
  defaultProps: {
    text: "Heading",
    level: "h2",
    size: "lg",
    color: "default",
    align: "auto",
  },
  render: ({ text, level: Tag, size, color, align }) => (
    <Tag
      className={cx(
        headingSizeClass[size],
        textColorClass[color],
        ownAlignClass[align],
        "[&_strong]:text-primary w-full [&_p]:inline",
      )}
    >
      {text}
    </Tag>
  ),
};

export const Text = {
  label: "Text",
  fields: {
    text: { type: "textarea", label: "Text", contentEditable: true },
    size: { type: "select", label: "Size", options: textSizeOptions },
    color: { type: "select", label: "Color", options: textColorOptions },
    bold: { type: "radio", label: "Bold", options: yesNo },
    narrow: {
      type: "radio",
      label: "Keep lines short (easier to read)",
      options: yesNo,
    },
    align: alignField,
  },
  defaultProps: {
    text: "Write something here.",
    size: "md",
    color: "default",
    bold: false,
    narrow: false,
    align: "auto",
  },
  render: ({ text, size, color, bold, narrow, align }) => (
    <p
      className={cx(
        "leading-relaxed whitespace-pre-line",
        textSizeClass[size],
        textColorClass[color],
        bold && "font-bold",
        narrow && "max-w-2xl",
        ownAlignClass[align],
      )}
    >
      {text}
    </p>
  ),
};

const buttonFields = {
  label: { type: "text", label: "Label" },
  link: { type: "text", label: "Link (https://… or /page)" },
  style: { type: "select", label: "Style", options: buttonStyleOptions },
};

function ButtonLink({ label, link, style, size, block }) {
  const href = safeUrl(link);
  const external = /^https?:/i.test(href);
  return (
    <a
      href={href}
      className={cx(
        "btn",
        buttonStyleClass[style],
        buttonSizeClass[size],
        block && "btn-block",
      )}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {label}
    </a>
  );
}

export const Button = {
  label: "Button",
  fields: {
    ...buttonFields,
    size: { type: "select", label: "Size", options: sizeOptions },
  },
  defaultProps: { label: "Button", link: "#", style: "primary", size: "md" },
  render: (props) => (
    <div>
      <ButtonLink {...props} />
    </div>
  ),
};

export const ButtonRow = {
  label: "Button row",
  fields: {
    buttons: {
      type: "array",
      label: "Buttons",
      arrayFields: buttonFields,
      defaultItemProps: { label: "Button", link: "#", style: "outline" },
      getItemSummary: (item) => item.label || "Button",
    },
    size: { type: "select", label: "Size", options: sizeOptions },
    align: {
      type: "radio",
      label: "Align",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
  },
  defaultProps: {
    buttons: [
      { label: "Button", link: "#", style: "primary" },
      { label: "Button", link: "#", style: "outline" },
    ],
    size: "md",
    align: "left",
  },
  render: ({ buttons, size, align }) => (
    <div className={cx("flex w-full flex-wrap gap-3", justifyClass[align])}>
      {buttons.map((button, i) => (
        <ButtonLink key={i} {...button} size={size} />
      ))}
    </div>
  ),
};

export const Badge = {
  label: "Badge",
  fields: {
    label: { type: "text", label: "Text", contentEditable: true },
    style: { type: "select", label: "Style", options: badgeStyleOptions },
    size: { type: "select", label: "Size", options: sizeOptions },
  },
  defaultProps: { label: "Badge", style: "secondary", size: "md" },
  render: ({ label, style, size }) => (
    <div>
      <span
        className={cx("badge", badgeStyleClass[style], badgeSizeClass[size])}
      >
        {label}
      </span>
    </div>
  ),
};
