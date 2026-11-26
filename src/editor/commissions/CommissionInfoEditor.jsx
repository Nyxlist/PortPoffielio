// "Commission info" in the Queue & comms dashboard: status, price lists, terms, contact.
import { ImageInput } from "../../builder/ImageField.jsx";

const newId = () => crypto.randomUUID();
const lines = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function Lines({ label, hint, value, onChange, rows = 4 }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {hint && <span className="text-xs opacity-60">{hint}</span>}
      <textarea
        className="textarea w-full"
        rows={rows}
        defaultValue={(value ?? []).join("\n")}
        onBlur={(e) => onChange(lines(e.target.value))}
      />
    </label>
  );
}

function PriceRows({ menu, setMenu }) {
  const currencies = menu.currencies ?? [];
  const setRows = (rows) => setMenu({ rows });
  const setRow = (i, patch) =>
    setRows(menu.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i, j) => {
    if (j < 0 || j >= menu.rows.length) return;
    const rows = [...menu.rows];
    [rows[i], rows[j]] = [rows[j], rows[i]];
    setRows(rows);
  };
  return (
    <div className="overflow-x-auto">
      <table className="table-xs table">
        <thead>
          <tr>
            <th>Type</th>
            {currencies.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {menu.rows.map((r, i) => (
            <tr key={r.id}>
              <td colSpan={r.heading ? currencies.length + 1 : 1}>
                <input
                  className={`input input-xs w-full ${r.heading ? "font-bold" : ""}`}
                  value={r.name}
                  placeholder={
                    r.heading ? "Group title (e.g. Add-ons)" : "Item"
                  }
                  onChange={(e) => setRow(i, { name: e.target.value })}
                />
              </td>
              {!r.heading &&
                currencies.map((_, c) => (
                  <td key={c}>
                    <input
                      className="input input-xs w-24"
                      value={r.prices?.[c] ?? ""}
                      onChange={(e) => {
                        const prices = [...(r.prices ?? [])];
                        prices[c] = e.target.value;
                        setRow(i, { prices });
                      }}
                    />
                  </td>
                ))}
              <td className="whitespace-nowrap">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => move(i, i - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => move(i, i + 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => setRows(menu.rows.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="btn btn-outline btn-xs"
          onClick={() =>
            setRows([
              ...menu.rows,
              { id: newId(), name: "", prices: [], heading: false },
            ])
          }
        >
          + Price row
        </button>
        <button
          type="button"
          className="btn btn-outline btn-xs"
          onClick={() =>
            setRows([
              ...menu.rows,
              { id: newId(), name: "Add-ons", prices: [], heading: true },
            ])
          }
        >
          + Group title
        </button>
      </div>
    </div>
  );
}

function MenuEditor({ menu, setMenu, onRemove }) {
  const images = menu.images ?? [];
  return (
    <div className="border-base-300 rounded-box grid gap-4 border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid flex-1 gap-1 text-sm">
          <span className="font-semibold">Title</span>
          <input
            className="input input-sm w-full"
            value={menu.title}
            onChange={(e) => setMenu({ title: e.target.value })}
          />
        </label>
        <label className="grid flex-1 gap-1 text-sm">
          <span className="font-semibold">
            Price columns (separate with commas)
          </span>
          <input
            className="input input-sm w-full"
            defaultValue={(menu.currencies ?? []).join(", ")}
            onBlur={(e) =>
              setMenu({
                currencies: e.target.value
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost btn-sm text-error"
          onClick={() =>
            confirm(`Delete the "${menu.title}" price list?`) && onRemove()
          }
        >
          Delete list
        </button>
      </div>
      <PriceRows menu={menu} setMenu={setMenu} />
      <Lines
        label="Base includes (one per line)"
        value={menu.includes}
        onChange={(includes) => setMenu({ includes })}
      />
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Small note</span>
        <input
          className="input input-sm w-full"
          value={menu.note ?? ""}
          onChange={(e) => setMenu({ note: e.target.value })}
        />
      </label>
      <div className="grid gap-2">
        <span className="text-sm font-semibold">Example pictures</span>
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((src, i) => (
            <div key={i} className="grid gap-1">
              <ImageInput
                name={`menu-img-${menu.id}-${i}`}
                label={`Picture ${i + 1}`}
                value={src}
                onChange={(v) =>
                  setMenu({ images: images.map((x, j) => (j === i ? v : x)) })
                }
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error justify-self-start"
                onClick={() =>
                  setMenu({ images: images.filter((_, j) => j !== i) })
                }
              >
                Remove picture
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-outline btn-xs justify-self-start"
          onClick={() => setMenu({ images: [...images, ""] })}
        >
          + Add a picture
        </button>
      </div>
    </div>
  );
}

export function CommissionInfoEditor({ info, setInfo }) {
  const set = (patch) => setInfo((c) => ({ ...c, ...patch }));
  const setMenu = (id) => (patch) =>
    setInfo((c) => ({
      ...c,
      menus: c.menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  return (
    <div className="grid max-w-4xl gap-8">
      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Status</h3>
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["open", "Open"],
            ["waitlist", "Waitlist"],
            ["closed", "Closed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm ${info.status === value ? "btn-primary" : "btn-outline"}`}
              onClick={() => set({ status: value })}
            >
              {label}
            </button>
          ))}
          <input
            className="input input-sm w-64"
            placeholder="Text, e.g. Waitlist for Mar 2027"
            value={info.statusText ?? ""}
            onChange={(e) => set({ statusText: e.target.value })}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Price lists</h3>
        {info.menus.map((menu) => (
          <MenuEditor
            key={menu.id}
            menu={menu}
            setMenu={setMenu(menu.id)}
            onRemove={() =>
              set({ menus: info.menus.filter((m) => m.id !== menu.id) })
            }
          />
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm justify-self-start"
          onClick={() =>
            set({
              menus: [
                ...info.menus,
                {
                  id: newId(),
                  title: "New price list",
                  currencies: ["USD", "IDR"],
                  rows: [],
                  includes: [],
                  note: "",
                  images: [],
                },
              ],
            })
          }
        >
          + Add a price list
        </button>
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold">Terms of service</h3>
        <Lines
          label="One rule per line"
          value={info.terms}
          onChange={(terms) => set({ terms })}
          rows={10}
        />
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">How to contact you</span>
          <textarea
            className="textarea w-full"
            rows={2}
            value={info.contact ?? ""}
            onChange={(e) => set({ contact: e.target.value })}
          />
        </label>
      </section>
    </div>
  );
}
