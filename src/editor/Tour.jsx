// Step-by-step guided tour of the editor. Shown on the first visit; replay it from "? Help".
import { useEffect, useLayoutEffect, useState } from "react";
import { usePuck } from "./EditorHeader.jsx";

const SEEN_KEY = "editor-tour-seen";
export const hasSeenTour = () => localStorage.getItem(SEEN_KEY) === "yes";

const isVisible = (el) =>
  !!el &&
  el.getClientRects().length > 0 &&
  el.getBoundingClientRect().width > 0;
/** Finds the element to highlight; on narrow windows some tools live in the "Menu", so point there. */
const find = (selector) => () => {
  const el = document.querySelector(selector);
  if (isVisible(el)) return el;
  const menu = document.querySelector('[data-tour="menu"]');
  return isVisible(menu) && /pages|theme|content|help/.test(selector)
    ? menu
    : el;
};

// `target` finds the element to highlight (none = centered card). `ui` opens/closes panels for the step.
const steps = [
  {
    title: "Welcome to your website editor!",
    text: "Everything on your site is made of blocks you can drag, drop, and change. This quick tour shows you where everything is. It takes about a minute.",
  },
  {
    title: "Add blocks",
    text: "This opens the block library. \u201cReady-made sections\u201d at the top adds a finished section in one click. Or drag single blocks onto your page: Layout blocks (Section, Columns, Card) are boxes you can drop other blocks into, so you can build any layout you like.",
    target: find('[data-tour="add-blocks"]'),
    ui: { leftSideBarVisible: true, rightSideBarVisible: false },
  },
  {
    title: "Your page",
    text: "This is your page, exactly as visitors will see it. Click anything to select it and type straight into headings and text. To color words in a heading, select them and press Highlight. A selected block gets a small black bar: drag “Move” to move it, use the arrow to select the box around it, and the buttons to duplicate or delete it. Clicking a menu link up top opens that page for editing.",
    target: find("#preview-frame"),
    ui: { leftSideBarVisible: false, rightSideBarVisible: false },
  },
  {
    title: "Place things anywhere",
    text: "Drag a picture file from your computer straight onto the page: it lands exactly where you drop it, and you can drag it anywhere, resize it from its edges, and turn it with the round handle. Hold Shift while dropping to add it as a normal block instead, or drop it onto an existing picture to replace it. Any block can do this too: tick “Free placement” in its Style settings. Free things keep the same layout on phones and tablets (they scale down).",
    target: find("#preview-frame"),
    ui: { leftSideBarVisible: false, rightSideBarVisible: false },
  },
  {
    title: "Block settings",
    text: "When you click a block, its settings open here. Every block has a Style section at the bottom: placement, any color or gradient, a backdrop picture (on Sections and Cards), corners, borders, shadows, sizes and spacing with sliders (px, %, and more), text (font, size, weight, spacing, a picture or gradient inside the letters), and animations. Pictures can be cropped, zoomed, masked with another picture, blended, and turned into hearts, stars, blobs and more. Picture boxes accept drag-and-drop and paste.",
    target: find('[data-tour="settings"]'),
    ui: { rightSideBarVisible: true },
  },
  {
    title: "Phone, tablet, and desktop",
    text: "Check how your page looks on different screens. The first icon fits the page to the window. Every block rearranges itself for phones automatically.",
    target: () =>
      document.querySelector('button[aria-label="Switch to Phone viewport"]')
        ?.parentElement?.parentElement,
    ui: { rightSideBarVisible: false },
  },
  {
    title: "Switch pages",
    text: "Pick which page you're editing.",
    target: find('[data-tour="page-select"]'),
  },
  {
    title: "Pages",
    text: "Add new pages (start blank or from a template), rename them, change their order in the menu, hide them from the menu, or delete them.",
    target: find('[data-tour="pages"]'),
  },
  {
    title: "Theme maker",
    text: "Opens the Theme maker on the side, so you see every change live. Pick a whole-page scene or plain theme, change colors and fonts (even your own), add your own falling things (any emoji, text or picture) and stickers, and choose click and scroll effects. Save looks you like under \u201cMy themes\u201d.",
    target: find('[data-tour="theme"]'),
  },
  {
    title: "Content",
    text: "Your stream schedule, updates, fanart, and social links live here. Change them once and every page that shows them updates.",
    target: find('[data-tour="content"]'),
  },
  {
    title: "Queue & comms",
    text: "Your commission queue and commission info, like your Trello board. Drag cards between lists, change the step and payment with the colored boxes, press “Next step →” as you work, and “✓ Finish” when it's done. The Commission info tab holds your status, price lists, and terms. Everything saves by itself and shows on the site right away.",
    target: find('[data-tour="queue"]'),
  },

  {
    title: "Undo and redo",
    text: "Made a mistake? Undo it (or press Ctrl+Z). Redo brings it back.",
    target: find('[data-tour="undo"]'),
  },
  {
    title: "Publish",
    text: "When a page looks right, press Publish to save it. Theme, Content, and Pages changes save by themselves.",
    target: find('[data-tour="publish"]'),
  },
  {
    title: "That's it!",
    text: 'You can replay this tour any time from "? Help". Have fun making your site!',
    target: find('[data-tour="help"]'),
  },
];

const PAD = 6;
const CARD_WIDTH = 340;

export function Tour({ onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const dispatch = usePuck((s) => s.dispatch);
  const step = steps[index];
  const last = index === steps.length - 1;

  useEffect(() => {
    if (step.ui) dispatch({ type: "setUi", ui: step.ui });
  }, [step, dispatch]);

  // Follow the highlighted element (panels slide open, the window can resize).
  useLayoutEffect(() => {
    let frame;
    const measure = () => {
      const el = step.target?.();
      const r = el?.getBoundingClientRect();
      const next =
        r && r.width
          ? {
              top: r.top - PAD,
              left: r.left - PAD,
              width: r.width + PAD * 2,
              height: r.height + PAD * 2,
            }
          : null;
      setRect((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      );
      frame = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(frame);
  }, [step]);

  function finish() {
    localStorage.setItem(SEEN_KEY, "yes");
    dispatch({
      type: "setUi",
      ui: { leftSideBarVisible: false, rightSideBarVisible: false },
    });
    onClose();
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" && !last) setIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && index > 0) setIndex((i) => i - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const card = cardPosition(rect);

  return (
    <div
      className="fixed inset-0 z-[1000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      {rect ? (
        <div
          className="ring-primary pointer-events-none fixed rounded-xl ring-4 transition-all duration-200"
          style={{ ...rect, boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.5)" }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/50" />
      )}
      <div
        className="card bg-base-100 fixed p-5 shadow-2xl"
        style={{ ...card, width: CARD_WIDTH }}
      >
        <p className="text-xs font-semibold opacity-60">
          Step {index + 1} of {steps.length}
        </p>
        <h2 id="tour-title" className="mt-1 text-lg font-extrabold">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed">{step.text}</p>
        <progress
          className="progress progress-primary mt-4"
          value={index + 1}
          max={steps.length}
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={finish}
          >
            {last ? "Close" : "Skip tour"}
          </button>
          <span className="flex-1" />
          {index > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIndex(index - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => (last ? finish() : setIndex(index + 1))}
            autoFocus
          >
            {last ? "Start editing" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Put the card below the highlight if there's room, else above, else beside; centered when nothing is highlighted. */
function cardPosition(rect) {
  const margin = 12;
  if (!rect)
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  const left = Math.min(
    Math.max(margin, rect.left + rect.width / 2 - CARD_WIDTH / 2),
    innerWidth - CARD_WIDTH - margin,
  );
  const below = rect.top + rect.height + margin;
  if (below + 240 < innerHeight) return { top: below, left };
  if (rect.top - margin - 240 > 0)
    return { top: rect.top - margin, left, transform: "translateY(-100%)" };
  const beside =
    rect.left + rect.width + margin + CARD_WIDTH < innerWidth
      ? rect.left + rect.width + margin
      : Math.max(margin, rect.left - CARD_WIDTH - margin);
  return {
    top: Math.max(margin, Math.min(rect.top, innerHeight - 280)),
    left: beside,
  };
}
