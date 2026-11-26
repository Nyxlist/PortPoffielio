import { useEffect, useRef } from "react";

/** A pop-up panel. Closes with Esc, the ✕ button, or a click outside. */
export function Dialog({ title, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div
        className={`modal-box max-h-[85vh] ${wide ? "max-w-3xl" : "max-w-xl"}`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Close"
            onClick={() => ref.current?.close()}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
