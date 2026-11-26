import { useContext, useEffect, useRef } from "react";
import { blockStyle } from "./block-style.js";
import { textStyle } from "./text-style.js";
import { styleField } from "./StyleField.jsx";
import { FreeLayerContext, freeOf } from "../free/frame.js";
import { FreeItem } from "../free/FreeItem.jsx";

/** "When it scrolls into view" animations start once the block is on screen. */
function useInView(ref, active) {
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;
    const View = node.ownerDocument.defaultView;
    const observer = new View.IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        node.classList.add("ta-in");
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, active]);
}

/**
 * Gives a block the shared "Style" settings (colors, backdrop, shape, size, text, animation,
 * free placement). Every block gets one wrapper element, which is also what the editor
 * selects and drags (Puck's `inline` mode), so the editor and the site look the same.
 */
export function withStyle(
  block,
  { defaultStyle = {}, backgroundImage = false } = {},
) {
  const config = {
    ...block,
    inline: true,
    fields: { ...block.fields, style: styleField({ backgroundImage }) },
    defaultProps: { ...block.defaultProps, style: defaultStyle },
    render: function StyledBlock(props) {
      const inFree = useContext(FreeLayerContext);
      const textRef = useRef(null);
      const s = props.style ?? {};
      const box = blockStyle(s, { free: inFree });
      const text = textStyle(s);
      useInView(textRef, !!text?.className.includes("ta-on-view"));
      const attrs = {
        "data-block-id": props.id,
        "data-block-type": config.typeName,
      };

      let content = (
        <FreeLayerContext.Provider value={false}>
          {block.render(props)}
        </FreeLayerContext.Provider>
      );
      if (text)
        content = (
          <div ref={textRef} className={text.className} style={text.style}>
            {content}
          </div>
        );

      if (inFree) {
        const f = freeOf(s);
        return (
          <FreeItem
            id={props.id}
            f={f}
            editing={props.puck?.isEditing}
            dragRef={props.puck?.dragRef}
            attrs={attrs}
          >
            <div
              className="free-box"
              style={{
                ...box?.style,
                rotate: f.rot ? `${f.rot}deg` : undefined,
                height: f.h ? "100%" : undefined,
              }}
            >
              {content}
            </div>
          </FreeItem>
        );
      }
      return (
        <div
          ref={props.puck?.dragRef}
          {...attrs}
          className="min-w-0"
          style={box?.style}
        >
          {content}
        </div>
      );
    },
  };
  return config;
}
