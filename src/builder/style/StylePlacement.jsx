// "Placement" in a block's Style: switch a block between the normal top-to-bottom layout and
// free placement (anywhere in its Section), plus exact position, size, turn and layer.
import { Control, Group, Segmented, Slider } from "./controls.jsx";
import { FRAME_W, defaultFree, frameScale, freeOrigin } from "../free/frame.js";
import {
  sectionOf,
  setFreePlacement,
  topLayer,
  useSelection,
} from "../free/free-store.js";

const num = {
  width: 70,
  padding: "3px 6px",
  border: "1px solid #d4d4d8",
  borderRadius: 6,
  fontSize: 12,
};

const previewDoc = () =>
  document.querySelector("#preview-frame")?.contentDocument ?? document;

/** Where the block is on screen right now, in frame units, so switching doesn't make it jump. */
function measure(id, sectionId) {
  const doc = previewDoc();
  const node = doc.querySelector(`[data-block-id="${id}"]`);
  const frame = doc.querySelector(`[data-frame-id="${sectionId}"]`);
  if (!node || !frame) return {};
  const k = frameScale(frame);
  const r = node.getBoundingClientRect();
  // Positions count from the content column (where free things are placed from).
  const f = (freeOrigin(doc, sectionId)?.node ?? frame).getBoundingClientRect();
  const flow = [...(frame.firstElementChild?.children ?? [])].filter(
    (c) => c.dataset.blockId && c.dataset.blockId !== id,
  );
  return {
    free: {
      x: Math.round((r.left - f.left) / k),
      y: Math.round((r.top - f.top) / k),
      w: Math.max(40, Math.round(r.width / k)),
    },
    // Back in the normal layout, it goes where it currently sits vertically.
    flowIndex: flow.filter((c) => {
      const b = c.getBoundingClientRect();
      return b.top + b.height / 2 < r.top + r.height / 2;
    }).length,
  };
}

function NumberBox({ label, value, onChange, suffix }) {
  return (
    <label style={{ display: "grid", gap: 2, fontSize: 11, fontWeight: 600 }}>
      {label}
      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <input
          type="number"
          value={value ?? ""}
          placeholder="Auto"
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          style={num}
        />
        <span style={{ fontWeight: 400 }}>{suffix}</span>
      </span>
    </label>
  );
}

export function StylePlacement({ s, onChange }) {
  const sel = useSelection();
  if (!sel?.id || sel.type === "Section") return null;
  const inFree = sel.inFree;
  const W =
    (sel.sectionId && freeOrigin(previewDoc(), sel.sectionId)?.width) ||
    FRAME_W;
  const f = { ...defaultFree, ...s.free };
  const setFree = (patch) => onChange({ ...s, free: { ...f, ...patch } });

  const toggle = (on) => {
    const section = sectionOf(sel.id);
    if (!section) return;
    setFreePlacement(sel.id, on, measure(sel.id, section.props.id));
  };

  return (
    <Group title="Placement" open>
      {!sel.sectionId ? (
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Put this block inside a Section to place it freely.
        </p>
      ) : (
        <label
          style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 12 }}
        >
          <input
            type="checkbox"
            checked={inFree}
            onChange={(e) => toggle(e.target.checked)}
          />
          <span>
            <b>Free placement</b>: drag it anywhere in its section, like in
            Figma. Keeps the same look on phones and tablets (it scales).
          </span>
        </label>
      )}
      {inFree && (
        <>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
            Drag it on the page to move. Edges and corner resize; the round
            handle turns it (Shift snaps). Numbers are in a {W}-wide frame.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <NumberBox
              label="X"
              value={f.x}
              onChange={(x) => setFree({ x: x ?? 0 })}
            />
            <NumberBox
              label="Y"
              value={f.y}
              onChange={(y) => setFree({ y: y ?? 0 })}
            />
            <NumberBox
              label="Width"
              value={f.w}
              onChange={(w) => setFree({ w: Math.max(16, w ?? 360) })}
              suffix={`${Math.round((f.w / W) * 100)}%`}
            />
            <NumberBox
              label="Height"
              value={f.h}
              onChange={(h) => setFree({ h })}
            />
          </div>
          <Control title="Width as % of the section">
            <Slider
              min={2}
              max={100}
              value={Math.round((f.w / W) * 100)}
              onChange={(p) => setFree({ w: Math.round((p / 100) * W) })}
              suffix="%"
            />
          </Control>
          <Control title="Turn">
            <Slider
              min={-180}
              max={180}
              value={f.rot ?? 0}
              onChange={(rot) => setFree({ rot })}
              suffix="°"
            />
          </Control>
          <Control title="Line up">
            <Segmented
              options={[
                { label: "Left", value: "l" },
                { label: "Center", value: "c" },
                { label: "Right", value: "r" },
              ]}
              value={null}
              onChange={(v) =>
                setFree({
                  x: {
                    l: 0,
                    c: Math.round((W - f.w) / 2),
                    r: W - f.w,
                  }[v],
                })
              }
            />
          </Control>
          <Control
            title={`Layer: ${f.z} (higher is on top; below 0 goes behind the normal blocks)`}
          >
            <Segmented
              options={[
                { label: "To front", value: 1 },
                { label: "Forward", value: "up" },
                { label: "Backward", value: "down" },
                { label: "To back", value: -1 },
              ]}
              value={null}
              onChange={(v) =>
                setFree({
                  z:
                    v === "up"
                      ? f.z + 1
                      : v === "down"
                        ? f.z - 1
                        : topLayer(sel.id, v),
                })
              }
            />
          </Control>
        </>
      )}
    </Group>
  );
}
