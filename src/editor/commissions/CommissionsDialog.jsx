// "Queue & comms": a full-screen dashboard for the commission queue and commission info.
// Changes save by themselves and show on every page that has a commission block.
import { useEffect, useState } from "react";
import {
  createDefaultCommissions,
  createDefaultQueue,
} from "../../data/default-commissions.js";
import { CommissionInfoEditor } from "./CommissionInfoEditor.jsx";
import { QueueBoard } from "./QueueBoard.jsx";
import { QueueSettings } from "./QueueSettings.jsx";

const tabs = [
  { id: "board", label: "Queue board" },
  { id: "settings", label: "Lists & labels" },
  { id: "info", label: "Commission info" },
];

export function CommissionsDialog({ site, onChange, onClose }) {
  const [tab, setTab] = useState("board");
  const queue = site.content.queue ?? createDefaultQueue();
  const info = site.content.commissions ?? createDefaultCommissions();
  const setContent = (key, fallback) => (fn) =>
    onChange((s) => ({
      ...s,
      content: {
        ...s.content,
        [key]: fn(s.content[key] ?? fallback),
      },
    }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="bg-base-100 fixed inset-0 z-[70] flex flex-col"
      role="dialog"
      aria-label="Queue and commissions"
    >
      <header className="border-base-300 flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <h2 className="text-lg font-extrabold">Queue & comms</h2>
        <div role="tablist" className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`btn btn-sm ${tab === t.id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs opacity-60">
          Saves by itself · shows on the site right away
        </p>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm"
          aria-label="Close queue and commissions"
          onClick={onClose}
        >
          ✕
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {tab === "board" && (
          <>
            <p className="mb-3 text-sm opacity-70">
              Drag cards between lists or up and down (top = next up). Change
              the step and payment with the colored boxes; "Next step →" moves
              it along, "✓ Finish" moves it to the finished list.
            </p>
            <QueueBoard
              queue={queue}
              setQueue={setContent("queue", createDefaultQueue())}
            />
          </>
        )}
        {tab === "settings" && (
          <QueueSettings
            queue={queue}
            setQueue={setContent("queue", createDefaultQueue())}
          />
        )}
        {tab === "info" && (
          <CommissionInfoEditor
            info={info}
            setInfo={setContent("commissions", createDefaultCommissions())}
          />
        )}
      </div>
    </div>
  );
}
