// Layout blocks: containers she can drop any other block into.
import { useLayoutEffect, useRef } from "react";
import { FreeLayerContext, frameWidths } from "../free/frame.js";
import { Control, Slider } from "../style/controls.jsx";
import {
  alignOptions,
  columnCountOptions,
  gapClass,
  paddingClass,
  paddingYClass,
  spacerClass,
  spacingOptions,
  textAlignClass,
  widthClass,
  widthOptions,
} from "../options.js";

const cx = (...classes) => classes.filter(Boolean).join(" ");

/**
 * Free things are placed relative to the section's content column (the same centered column
 * the normal blocks use), designed at `frameWidths[width]`. --k = real column width / design
 * width, so free things stay lined up with the content on every screen size.
 */
function useFrameScale(designWidth) {
  const section = useRef(null);
  const origin = useRef(null);
  useLayoutEffect(() => {
    const node = origin.current;
    if (!node || !section.current) return;
    const update = () =>
      section.current?.style.setProperty(
        "--k",
        String(node.clientWidth / designWidth || 1),
      );
    update();
    const View = node.ownerDocument.defaultView;
    const observer = new View.ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [designWidth]);
  return { section, origin };
}

function SectionFrame({
  id,
  blocks: Content,
  free: Free,
  width,
  spacing,
  gap,
  align,
  height,
}) {
  const designWidth = frameWidths[width] ?? frameWidths.normal;
  const refs = useFrameScale(designWidth);
  return (
    <section
      ref={refs.section}
      data-frame-id={id}
      className={cx("free-frame", paddingYClass[spacing])}
      style={
        height > 0
          ? { minHeight: `calc(var(--k, 1) * ${height}px)` }
          : undefined
      }
    >
      <Content
        className={cx(
          "mx-auto flex flex-col px-6",
          widthClass[width],
          gapClass[gap],
          textAlignClass[align],
        )}
        minEmptyHeight={height > 0 ? 0 : 120}
      />
      {typeof Free === "function" && (
        // Same box as the content column above (same classes), so free things line up with
        // the normal blocks at every screen size, with or without the scene's panel.
        <div className={cx("free-column mx-auto px-6", widthClass[width])}>
          <div
            ref={refs.origin}
            data-free-origin={id}
            data-frame-w={designWidth}
            className="free-origin"
          >
            <FreeLayerContext.Provider value>
              <Free className="free-layer" minEmptyHeight={0} />
            </FreeLayerContext.Provider>
          </div>
        </div>
      )}
    </section>
  );
}

const heightField = {
  type: "custom",
  label: "Free area height",
  render: ({ value, onChange }) => (
    <Control title="Extra height (room for things placed freely; 0 = fit the content)">
      <Slider
        min={0}
        max={1600}
        step={20}
        value={value ?? 0}
        onChange={onChange}
        suffix=""
      />
    </Control>
  ),
};

export const Section = {
  label: "Section",
  fields: {
    blocks: { type: "slot" },
    // Blocks placed freely (anywhere in the section). Filled by "Free placement", never by dragging.
    free: { type: "slot", allow: [] },
    height: heightField,
    width: { type: "select", label: "Content width", options: widthOptions },
    spacing: {
      type: "select",
      label: "Space above & below",
      options: spacingOptions,
    },
    gap: {
      type: "select",
      label: "Space between blocks",
      options: spacingOptions,
    },
    align: { type: "radio", label: "Align", options: alignOptions },
  },
  defaultProps: {
    blocks: [],
    free: [],
    height: 0,
    width: "normal",
    spacing: "md",
    gap: "lg",
    align: "left",
  },
  // Background color and backdrop picture come from the block's Style settings.
  render: (props) => <SectionFrame {...props} />,
};

const columnLayouts = {
  1: { grid: "md:grid-cols-1", spans: [""] },
  2: { grid: "md:grid-cols-2", spans: ["", ""] },
  3: { grid: "md:grid-cols-3", spans: ["", "", ""] },
  4: { grid: "sm:grid-cols-2 md:grid-cols-4", spans: ["", "", "", ""] },
  "2-wide-left": { grid: "md:grid-cols-3", spans: ["md:col-span-2", ""] },
  "2-wide-right": { grid: "md:grid-cols-3", spans: ["", "md:col-span-2"] },
};

export const Columns = {
  label: "Columns",
  fields: {
    layout: {
      type: "select",
      label: "Columns",
      options: [
        ...columnCountOptions.map((o) => ({
          label: `${o.label} equal`,
          value: String(o.value),
        })),
        { label: "2 — wide left", value: "2-wide-left" },
        { label: "2 — wide right", value: "2-wide-right" },
      ],
    },
    gap: {
      type: "select",
      label: "Space between columns",
      options: spacingOptions,
    },
    verticalAlign: {
      type: "radio",
      label: "Line up",
      options: [
        { label: "Top", value: "start" },
        { label: "Middle", value: "center" },
      ],
    },
    column1: { type: "slot" },
    column2: { type: "slot" },
    column3: { type: "slot" },
    column4: { type: "slot" },
  },
  defaultProps: {
    layout: "2",
    gap: "lg",
    verticalAlign: "center",
    column1: [],
    column2: [],
    column3: [],
    column4: [],
  },
  render: ({
    layout,
    gap,
    verticalAlign,
    column1,
    column2,
    column3,
    column4,
  }) => {
    const { grid, spans } = columnLayouts[layout] ?? columnLayouts[2];
    const slots = [column1, column2, column3, column4].slice(0, spans.length);
    return (
      <div
        className={cx(
          "grid w-full grid-cols-1 text-left",
          grid,
          gapClass[gap],
          verticalAlign === "center" ? "items-center" : "items-start",
        )}
      >
        {slots.map((Column, i) => (
          <Column
            key={i}
            // The editor stretches columns to full height, so center the content inside the
            // column too; otherwise it sits at the top in the editor but centered on the site.
            className={cx(
              "flex min-w-0 flex-col gap-6",
              verticalAlign === "center" ? "justify-center" : "justify-start",
              spans[i],
            )}
            minEmptyHeight={80}
          />
        ))}
      </div>
    );
  },
};

export const Card = {
  label: "Card",
  fields: {
    blocks: { type: "slot" },
    padding: { type: "select", label: "Inner space", options: spacingOptions },
    gap: {
      type: "select",
      label: "Space between blocks",
      options: spacingOptions,
    },
  },
  defaultProps: {
    blocks: [],
    padding: "md",
    gap: "sm",
  },
  // Color, border, corners and backdrop come from the block's Style settings.
  render: ({ blocks: Content, padding, gap }) => (
    <Content
      className={cx(
        "flex w-full flex-col text-left",
        paddingClass[padding],
        gapClass[gap],
      )}
      minEmptyHeight={64}
    />
  ),
};

export const Spacer = {
  label: "Spacer",
  fields: { size: { type: "select", label: "Size", options: spacingOptions } },
  defaultProps: { size: "md" },
  render: ({ size }) => (
    <div className={spacerClass[size]} aria-hidden="true" />
  ),
};

export const Divider = {
  label: "Divider",
  fields: {},
  render: () => <hr className="border-base-300 w-full" />,
};
