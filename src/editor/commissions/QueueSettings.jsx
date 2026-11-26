// "Lists & labels" in the Queue & comms dashboard: the board's lists, the progress steps
// (shown as a progress bar on the site), and the payment labels.

const newId = () => crypto.randomUUID();

/** A simple editable list of rows: change, reorder, add, remove. */
function Rows({
  items,
  onChange,
  render,
  newItem,
  addLabel,
  canRemove = () => true,
}) {
  const set = (i, patch) =>
    onChange(items.map((item, j) => (j === i ? { ...item, ...patch } : item)));
  const swap = (i, j) => {
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="grid gap-2">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="border-base-300 rounded-box flex flex-wrap items-center gap-2 border p-2"
        >
          {render(item, (patch) => set(i, patch))}
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              disabled={i === 0}
              onClick={() => swap(i, i - 1)}
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              disabled={i === items.length - 1}
              onClick={() => swap(i, i + 1)}
              title="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-error"
              disabled={!canRemove(item)}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline btn-sm justify-self-start"
        onClick={() => onChange([...items, newItem()])}
      >
        {addLabel}
      </button>
    </div>
  );
}

function LabelRow({ item, set }) {
  return (
    <>
      <input
        type="color"
        className="h-8 w-10 cursor-pointer rounded border"
        value={item.color}
        onChange={(e) => set({ color: e.target.value })}
        aria-label="Color"
      />
      <input
        className="input input-sm w-44"
        value={item.name}
        onChange={(e) => set({ name: e.target.value })}
        aria-label="Name"
      />
    </>
  );
}

export function QueueSettings({ queue, setQueue }) {
  const set = (key) => (value) => setQueue((q) => ({ ...q, [key]: value }));
  return (
    <div className="grid max-w-3xl gap-8">
      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Lists (columns on the board)</h3>
        <p className="text-sm opacity-70">
          "Queue" lists are work in progress (top = next up). "Finished" lists
          are done work (newest on top). ✓ Finish moves a card to the first
          finished list.
        </p>
        <Rows
          items={queue.lists}
          onChange={set("lists")}
          addLabel="+ Add a list"
          newItem={() => ({
            id: newId(),
            title: "New list",
            kind: "queue",
            cards: [],
          })}
          canRemove={(l) => !l.cards.length}
          render={(list, update) => (
            <>
              <input
                className="input input-sm w-56"
                value={list.title}
                onChange={(e) => update({ title: e.target.value })}
                aria-label="List name"
              />
              <select
                className="select select-sm w-32"
                value={list.kind}
                onChange={(e) => update({ kind: e.target.value })}
              >
                <option value="queue">Queue</option>
                <option value="finished">Finished</option>
              </select>
              <span className="text-xs opacity-60">
                {list.cards.length} cards
                {list.cards.length ? " (empty it to remove)" : ""}
              </span>
            </>
          )}
        />
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Progress steps</h3>
        <p className="text-sm opacity-70">
          In order, from first to last. The last step means done. Visitors see a
          progress bar.
        </p>
        <Rows
          items={queue.stages}
          onChange={set("stages")}
          addLabel="+ Add a step"
          newItem={() => ({ id: newId(), name: "New step", color: "#fbcfe8" })}
          canRemove={() => queue.stages.length > 2}
          render={(item, update) => <LabelRow item={item} set={update} />}
        />
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Payment labels</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={queue.showPayment !== false}
            onChange={(e) => set("showPayment")(e.target.checked)}
          />
          Show payment labels on the website (turn off to keep them private)
        </label>
        <Rows
          items={queue.payments}
          onChange={set("payments")}
          addLabel="+ Add a payment label"
          newItem={() => ({ id: newId(), name: "New label", color: "#bfdbfe" })}
          render={(item, update) => <LabelRow item={item} set={update} />}
        />
      </section>
    </div>
  );
}
