// Commission blocks: the progress queue (like her Trello board), the commission status,
// price lists, and terms of service. All of it is edited in the editor's "Queue & comms"
// dashboard, so updating the queue once updates every page that shows it.
import { useSiteContent } from "../../site/live-site.js";
import { readableOn } from "../../lib/theme.js";
import { safeImageUrl } from "../../lib/safe-url.js";
import { yesNo } from "../options.js";

const cx = (...classes) => classes.filter(Boolean).join(" ");
const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v ?? "");

function Chip({ label }) {
  if (!label) return null;
  const bg = isHex(label.color) ? label.color : "#e4e4e7";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] leading-4 font-bold"
      style={{ background: bg, color: readableOn(bg) }}
    >
      {label.name}
    </span>
  );
}

function Progress({ stages, stage }) {
  const index = Math.max(
    0,
    stages.findIndex((s) => s.id === stage),
  );
  const steps = Math.max(1, stages.length - 1);
  const percent = Math.round((index / steps) * 100);
  return (
    <div className="mt-2" title={`${percent}% done`}>
      <div className="bg-base-200 h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function QueueCard({
  card,
  queue,
  first,
  finished,
  showProgress,
  showPayment,
}) {
  const stage = queue.stages?.find((s) => s.id === card.stage);
  const payment = queue.payments?.find((p) => p.id === card.payment);
  return (
    <li className="bg-base-100 text-base-content border-base-300 rounded-box border p-3 shadow-sm">
      <div className="flex flex-wrap gap-1">
        {first && !finished && (
          <span className="bg-primary text-primary-content rounded-full px-2 py-0.5 text-[11px] leading-4 font-bold">
            Next up
          </span>
        )}
        {!finished && <Chip label={stage} />}
        {showPayment && <Chip label={payment} />}
      </div>
      <p className="mt-1 font-semibold break-words">
        {finished && <span className="text-success mr-1">✓</span>}
        {card.title}
      </p>
      {card.note && <p className="text-sm opacity-70">{card.note}</p>}
      {showProgress && !finished && (
        <Progress stages={queue.stages ?? []} stage={card.stage} />
      )}
    </li>
  );
}

export const CommissionQueue = {
  label: "Commission queue",
  fields: {
    show: {
      type: "radio",
      label: "Show",
      options: [
        { label: "Everything", value: "all" },
        { label: "Queue only", value: "queue" },
        { label: "Finished only", value: "finished" },
      ],
    },
    limit: {
      type: "number",
      label: "Cards per list (0 = all)",
      min: 0,
    },
    progress: { type: "radio", label: "Progress bars", options: yesNo },
    layout: {
      type: "radio",
      label: "Layout",
      options: [
        { label: "Board (side by side)", value: "board" },
        { label: "Stacked", value: "stacked" },
      ],
    },
  },
  defaultProps: { show: "all", limit: 0, progress: true, layout: "board" },
  render: ({ show, limit, progress, layout, puck }) => {
    const queue = useSiteContent(puck).queue ?? {};
    const lists = (queue.lists ?? []).filter(
      (l) => show === "all" || l.kind === show,
    );
    if (!lists.length)
      return (
        <p className="rounded-box bg-base-200 w-full p-6 text-center opacity-70">
          The queue is empty right now.
        </p>
      );
    return (
      <div
        className={cx(
          "w-full text-left",
          layout === "stacked"
            ? "grid gap-6 sm:grid-cols-2"
            : "flex snap-x gap-4 overflow-x-auto pb-3",
        )}
      >
        {lists.map((list) => {
          const finished = list.kind === "finished";
          const cards = limit > 0 ? list.cards.slice(0, limit) : list.cards;
          return (
            <section
              key={list.id}
              className={cx(
                "bg-base-200/80 rounded-box p-3",
                layout === "stacked" ? "" : "w-72 shrink-0 snap-start",
              )}
            >
              <h3 className="mb-1 flex items-center justify-between gap-2 px-1 font-bold">
                <span>✧˖° {list.title} ˚.✧</span>
                <span className="text-sm opacity-60">{list.cards.length}</span>
              </h3>
              <p className="mb-2 px-1 text-xs opacity-60">
                {finished ? "Most recent first" : "Top = next up"}
              </p>
              <ol className="grid gap-2">
                {cards.map((card, i) => (
                  <QueueCard
                    key={card.id}
                    card={card}
                    queue={queue}
                    first={i === 0}
                    finished={finished}
                    showProgress={progress}
                    showPayment={queue.showPayment !== false}
                  />
                ))}
                {!cards.length && (
                  <li className="p-2 text-sm opacity-60">Nothing here yet.</li>
                )}
              </ol>
            </section>
          );
        })}
      </div>
    );
  },
};

const statusLook = {
  open: "bg-success text-success-content",
  waitlist: "bg-primary text-primary-content",
  closed: "bg-base-300 text-base-content",
};

export const CommissionStatus = {
  label: "Commission status",
  fields: {},
  render: ({ puck }) => {
    const c = useSiteContent(puck).commissions ?? {};
    const label =
      c.statusText ||
      { open: "Open", waitlist: "Waitlist", closed: "Closed" }[c.status] ||
      "";
    return (
      <p
        className={cx(
          "inline-block rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase",
          statusLook[c.status] ?? statusLook.waitlist,
        )}
      >
        ⟡ Status: {label} ⟡
      </p>
    );
  },
};

function PriceMenu({ menu, showImages }) {
  const currencies = menu.currencies ?? [];
  const images = (menu.images ?? []).map(safeImageUrl).filter(Boolean);
  return (
    <div className="w-full text-left">
      <h3 className="text-primary mb-3 text-xl font-extrabold tracking-widest uppercase">
        {menu.title}
      </h3>
      {showImages && images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="rounded-box aspect-video w-full object-cover"
            />
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-sm table w-full">
          <thead>
            <tr className="text-primary">
              <th>Type</th>
              {currencies.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(menu.rows ?? []).map((r) =>
              r.heading ? (
                <tr key={r.id}>
                  <th
                    colSpan={currencies.length + 1}
                    className="text-primary pt-4"
                  >
                    {r.name}
                  </th>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  {currencies.map((_, i) => (
                    <td key={i} className="font-semibold">
                      {r.prices?.[i] ?? ""}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      {(menu.includes ?? []).length > 0 && (
        <>
          <p className="text-primary mt-5 mb-2 font-bold">⟡ Base includes ⟡</p>
          <ul className="grid gap-1">
            {menu.includes.map((line, i) => (
              <li key={i}>● {line}</li>
            ))}
          </ul>
        </>
      )}
      {menu.note && <p className="mt-2 text-sm opacity-70">{menu.note}</p>}
    </div>
  );
}

export const CommissionPrices = {
  label: "Commission prices",
  fields: {
    images: { type: "radio", label: "Example pictures", options: yesNo },
  },
  defaultProps: { images: true },
  render: ({ images, puck }) => {
    const menus = useSiteContent(puck).commissions?.menus ?? [];
    if (!menus.length)
      return (
        <p className="rounded-box bg-base-200 w-full p-6 text-center opacity-70">
          No price lists yet.
        </p>
      );
    return (
      <div className="grid w-full gap-10">
        {menus.map((menu) => (
          <PriceMenu key={menu.id} menu={menu} showImages={images} />
        ))}
      </div>
    );
  },
};

export const CommissionTerms = {
  label: "Terms of service",
  fields: {
    contact: { type: "radio", label: "Show how to contact", options: yesNo },
  },
  defaultProps: { contact: true },
  render: ({ contact, puck }) => {
    const c = useSiteContent(puck).commissions ?? {};
    return (
      <div className="w-full text-left">
        <ul className="grid gap-2">
          {(c.terms ?? []).map((t, i) => (
            <li key={i}>● {t}</li>
          ))}
        </ul>
        {contact && c.contact && (
          <p className="bg-base-200 rounded-box mt-5 p-4 font-semibold">
            {c.contact}
          </p>
        )}
      </div>
    );
  },
};
