// Small shared controls for the Theme maker tabs.

export const chip = (active) =>
  `btn btn-sm ${active ? "btn-primary" : "btn-outline"}`;

/** Buttons where exactly one is chosen. */
export function Choice({ options, value, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={chip(o.value === value)}
          aria-pressed={o.value === value}
          onClick={() => onPick(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Section({ title, hint, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-bold">{title}</h3>
        {hint && <p className="text-xs opacity-60">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Label({ title, children }) {
  return (
    <div className="space-y-1 text-sm">
      <span className="font-semibold">{title}</span>
      {children}
    </div>
  );
}

export const amountOptions = [
  { value: "few", label: "A few" },
  { value: "some", label: "Some" },
  { value: "lots", label: "Lots" },
];
export const speedOptions = [
  { value: "calm", label: "Calm" },
  { value: "normal", label: "Normal" },
  { value: "lively", label: "Lively" },
];
