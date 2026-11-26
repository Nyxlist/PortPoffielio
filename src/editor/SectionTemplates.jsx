// "Ready-made sections" button at the top of the block library: adds a finished section to the page.
import { useState } from "react";
import { usePuck } from "./EditorHeader.jsx";
import { Dialog } from "./Dialog.jsx";
import { sectionTemplates } from "../data/templates.js";

/** Scrolls the page preview to the block that was just added, once it has been drawn. */
function scrollToBlock(id) {
  setTimeout(() => {
    const doc = document.querySelector("#preview-frame")?.contentDocument;
    doc
      ?.querySelector(`[data-puck-component="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}

export function SectionTemplatesButton() {
  const [open, setOpen] = useState(false);
  const dispatch = usePuck((s) => s.dispatch);

  function add(template) {
    const block = template.build();
    dispatch({
      type: "setData",
      data: (data) => ({ ...data, content: [...data.content, block] }),
    });
    setOpen(false);
    scrollToBlock(block.props.id);
  }

  return (
    <>
      <div style={{ padding: "12px 12px 4px" }}>
        <button
          type="button"
          data-tour="templates"
          className="btn btn-primary btn-sm w-full"
          onClick={() => setOpen(true)}
        >
          ✨ Ready-made sections
        </button>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          Or drag single blocks below onto your page.
        </p>
      </div>
      {open && (
        <Dialog title="Ready-made sections" onClose={() => setOpen(false)} wide>
          <p className="mb-4 text-sm opacity-70">
            Pick one to add it to the bottom of this page. You can then move it
            and change anything in it.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sectionTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                className="rounded-box border-base-300 hover:border-primary hover:bg-base-200 border p-4 text-left transition"
                onClick={() => add(t)}
              >
                <span className="block font-bold">{t.name}</span>
                <span className="mt-1 block text-sm opacity-70">
                  {t.description}
                </span>
              </button>
            ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
