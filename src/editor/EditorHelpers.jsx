// Small helpers that run inside the editor to make dragging and selecting smoother.
import { useEffect } from "react";
import { ActionBar } from "@puckeditor/core";
import { usePuck } from "./EditorHeader.jsx";

/** Opens the settings panel whenever she clicks a block, so she never has to look for it. */
export function AutoOpenSettings() {
  const selected = usePuck((s) => s.selectedItem?.props?.id);
  const dispatch = usePuck((s) => s.dispatch);
  // Only when a *different* block gets selected, so closing the panel by hand still works.
  useEffect(() => {
    if (selected)
      dispatch({ type: "setUi", ui: { rightSideBarVisible: true } });
  }, [selected, dispatch]);
  return null;
}

/** While dragging, the floating panels fade out and let the mouse through, so she can see where the block lands. */
export function FadePanelsWhileDragging() {
  const dragging = usePuck((s) => s.appState.ui.isDragging);
  useEffect(() => {
    document.body.toggleAttribute("data-dragging", dragging);
  }, [dragging]);
  return null;
}

const moveHandleStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  borderRadius: 6,
  background: "rgb(255 255 255 / 0.15)",
  color: "white",
  fontSize: 12,
  fontWeight: 600,
  cursor: "grab",
  whiteSpace: "nowrap",
  touchAction: "none",
};

/**
 * Selects the block that contains the selected one (e.g. the Section around a heading).
 * Replaces Puck's own button, which could miss clicks while text was being edited.
 * Reacts on mouse-down (before the editor redraws) and keeps focus where it is.
 */
function SelectParentButton() {
  const selectedId = usePuck((s) => s.selectedItem?.props?.id);
  const getParentById = usePuck((s) => s.getParentById);
  const getSelectorForId = usePuck((s) => s.getSelectorForId);
  const dispatch = usePuck((s) => s.dispatch);
  const parent = selectedId ? getParentById(selectedId) : null;
  // Blocks sitting directly on the page have nothing around them to select.
  const parentId = parent?.props?.id;
  if (
    !parentId ||
    parent.type === "root" ||
    parentId === "root" ||
    !getSelectorForId(parentId)
  )
    return null;
  const selectParent = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const selector = getSelectorForId(parentId);
    if (selector) dispatch({ type: "setUi", ui: { itemSelector: selector } });
  };
  return (
    <ActionBar.Action
      label="Select the box around this"
      onMouseDown={selectParent}
      onClick={(e) => e.stopPropagation()}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>↰</span>
    </ActionBar.Action>
  );
}

/**
 * The black bar on a selected block, with a clearly labeled "Move" grip first.
 * Text blocks can only be moved by this grip, because pressing on text selects it for editing.
 */
export function BlockActionBar({ label, children, dragHandleRef }) {
  return (
    <ActionBar>
      {/* Mouse-downs on the bar don't take focus away from text being edited. Otherwise the
          editor redraws mid-click and buttons like Duplicate miss the first click. */}
      <div
        style={{ display: "contents" }}
        onMouseDown={(event) => event.preventDefault()}
      >
        {dragHandleRef && (
          <ActionBar.Group>
            <span
              ref={dragHandleRef}
              style={moveHandleStyle}
              title="Drag to move this block"
            >
              ⠿ Move
            </span>
          </ActionBar.Group>
        )}
        <ActionBar.Group>
          <SelectParentButton />
          {label && <ActionBar.Label label={label} />}
        </ActionBar.Group>
        <ActionBar.Group>{children}</ActionBar.Group>
      </div>
    </ActionBar>
  );
}

/**
 * Backspace/Delete only work while typing. Without this, pressing Backspace with a block
 * selected (but not being typed in) deletes the whole block. The trash button still deletes.
 */
export function GuardDeleteKeys() {
  useEffect(() => {
    const ignoreUnlessTyping = (event) => {
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      const target = event.target;
      const typing =
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (!typing) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    // Listen on the editor page and inside the page preview (an iframe that can be recreated).
    const docs = new Set();
    const attach = (doc) => {
      if (!doc || docs.has(doc)) return;
      doc.addEventListener("keydown", ignoreUnlessTyping, true);
      docs.add(doc);
    };
    attach(document);
    const timer = setInterval(
      () => attach(document.querySelector("#preview-frame")?.contentDocument),
      500,
    );
    return () => {
      clearInterval(timer);
      for (const doc of docs)
        doc.removeEventListener("keydown", ignoreUnlessTyping, true);
    };
  }, []);
  return null;
}
