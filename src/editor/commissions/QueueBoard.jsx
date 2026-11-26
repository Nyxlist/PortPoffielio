// The queue board in the "Queue & comms" dashboard: drag cards between lists (like Trello),
// pick the step and payment, move up/down, "Next step", and "Finish" in one click.
import { useState } from "react";

const newCard = () => ({
  id: crypto.randomUUID(),
  title: "New commission",
  note: "",
  stage: "waiting",
  payment: "",
});

/** Moves a card to `toList` before `beforeId` (or to the end). Returns the new lists. */
function moveCard(lists, cardId, toListId, beforeId) {
  let moving = null;
  const without = lists.map((l) => ({
    ...l,
    cards: l.cards.filter((c) =>
      c.id === cardId ? ((moving = c), false) : true,
    ),
  }));
  if (!moving) return lists;
  return without.map((l) => {
    if (l.id !== toListId) return l;
    const cards = [...l.cards];
    const at = beforeId ? cards.findIndex((c) => c.id === beforeId) : -1;
    cards.splice(at < 0 ? cards.length : at, 0, moving);
    return { ...l, cards };
  });
}

function LabelSelect({ value, options, onChange, emptyLabel }) {
  const current = options.find((o) => o.id === value);
  return (
    <select
      className="select select-xs w-full font-semibold"
      style={current ? { background: current.color } : undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {emptyLabel && <option value="">{emptyLabel}</option>}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function CardEditor({
  card,
  list,
  queue,
  index,
  actions,
  dragging,
  setDragging,
}) {
  const [open, setOpen] = useState(false);
  const stageIndex = queue.stages.findIndex((s) => s.id === card.stage);
  const lastStage = stageIndex >= queue.stages.length - 1;
  const finished = list.kind === "finished";
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", card.id);
        setDragging(card.id);
      }}
      onDragEnd={() => setDragging(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.drop(list.id, card.id);
      }}
      className={`bg-base-100 border-base-300 rounded-box cursor-grab border p-2 shadow-sm ${dragging === card.id ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-1">
        <span className="mt-1 cursor-grab opacity-40" aria-hidden="true">
          ⠿
        </span>
        <input
          className="input input-ghost input-sm h-auto min-h-8 flex-1 px-1 font-semibold"
          value={card.title}
          onChange={(e) => actions.update(card.id, { title: e.target.value })}
          aria-label="Commission name"
        />
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          title="More"
          onClick={() => setOpen(!open)}
        >
          {open ? "▴" : "▾"}
        </button>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1">
        <LabelSelect
          value={card.stage}
          options={queue.stages}
          onChange={(stage) => actions.update(card.id, { stage })}
        />
        <LabelSelect
          value={card.payment}
          options={queue.payments}
          emptyLabel="No payment label"
          onChange={(payment) => actions.update(card.id, { payment })}
        />
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {!finished && !lastStage && (
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={() =>
              actions.update(card.id, {
                stage: queue.stages[stageIndex + 1]?.id ?? card.stage,
              })
            }
          >
            Next step →
          </button>
        )}
        {!finished && (
          <button
            type="button"
            className="btn btn-success btn-xs"
            onClick={() => actions.finish(card.id)}
          >
            ✓ Finish
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          title="Move up (higher priority)"
          disabled={index === 0}
          onClick={() => actions.shift(list.id, card.id, -1)}
        >
          ↑
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          title="Move down"
          disabled={index === list.cards.length - 1}
          onClick={() => actions.shift(list.id, card.id, 1)}
        >
          ↓
        </button>
      </div>
      {open && (
        <div className="mt-2 grid gap-1">
          <textarea
            className="textarea textarea-sm w-full"
            placeholder="Note shown under the name (optional)"
            value={card.note ?? ""}
            onChange={(e) => actions.update(card.id, { note: e.target.value })}
          />
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error justify-self-start"
            onClick={() =>
              confirm(`Delete "${card.title}"?`) && actions.remove(card.id)
            }
          >
            Delete card
          </button>
        </div>
      )}
    </li>
  );
}

export function QueueBoard({ queue, setQueue }) {
  const [dragging, setDragging] = useState(null);
  const setLists = (fn) => setQueue((q) => ({ ...q, lists: fn(q.lists) }));
  const mapCards = (fn) =>
    setLists((lists) => lists.map((l) => ({ ...l, cards: fn(l.cards, l) })));

  const actions = {
    update: (id, patch) =>
      mapCards((cards) =>
        cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      ),
    remove: (id) => mapCards((cards) => cards.filter((c) => c.id !== id)),
    drop: (listId, beforeId) => {
      if (dragging && dragging !== beforeId)
        setLists((lists) => moveCard(lists, dragging, listId, beforeId));
      setDragging(null);
    },
    shift: (listId, id, step) =>
      setLists((lists) =>
        lists.map((l) => {
          if (l.id !== listId) return l;
          const cards = [...l.cards];
          const i = cards.findIndex((c) => c.id === id);
          const j = i + step;
          if (i < 0 || j < 0 || j >= cards.length) return l;
          [cards[i], cards[j]] = [cards[j], cards[i]];
          return { ...l, cards };
        }),
      ),
    // Finished work goes to the top of the first "finished" list (most recent first).
    finish: (id) =>
      setLists((lists) => {
        const target = lists.find((l) => l.kind === "finished");
        let card = null;
        const rest = lists.map((l) => ({
          ...l,
          cards: l.cards.filter((c) =>
            c.id === id ? ((card = c), false) : true,
          ),
        }));
        if (!card || !target) return lists;
        const doneStage = queue.stages[queue.stages.length - 1]?.id;
        return rest.map((l) =>
          l.id === target.id
            ? { ...l, cards: [{ ...card, stage: doneStage }, ...l.cards] }
            : l,
        );
      }),
  };

  return (
    <div className="flex h-full gap-3 overflow-x-auto pb-2">
      {queue.lists.map((list) => (
        <section
          key={list.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            actions.drop(list.id, null);
          }}
          className={`bg-base-200 rounded-box flex w-72 shrink-0 flex-col p-2 ${list.kind === "finished" ? "opacity-90" : ""}`}
        >
          <div className="mb-2 flex items-center gap-2 px-1">
            <h3 className="flex-1 truncate font-bold">{list.title}</h3>
            <span className="badge badge-sm">{list.cards.length}</span>
          </div>
          <ol className="grid flex-1 content-start gap-2 overflow-y-auto">
            {list.cards.map((card, i) => (
              <CardEditor
                key={card.id}
                card={card}
                list={list}
                queue={queue}
                index={i}
                actions={actions}
                dragging={dragging}
                setDragging={setDragging}
              />
            ))}
          </ol>
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-2"
            onClick={() =>
              setLists((lists) =>
                lists.map((l) =>
                  l.id === list.id
                    ? {
                        ...l,
                        cards:
                          l.kind === "finished"
                            ? [{ ...newCard(), stage: "done" }, ...l.cards]
                            : [...l.cards, newCard()],
                      }
                    : l,
                ),
              )
            }
          >
            + Add a card
          </button>
        </section>
      ))}
    </div>
  );
}
