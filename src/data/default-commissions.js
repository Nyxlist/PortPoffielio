// Starting data for the commission queue and commission info, taken from her Trello board
// ("Poffie Hunni's Queue") and her Carrd page. She edits both in the editor's "Queue & comms".

const id = () => crypto.randomUUID();

/** Progress steps (in order). A card's step shows as a progress bar on the site. */
export const defaultStages = [
  { id: "waiting", name: "Waiting", color: "#e4e4e7" },
  { id: "sketch", name: "Sketch", color: "#fecaca" },
  { id: "lineart", name: "Line Art", color: "#f472b6" },
  { id: "coloring", name: "Coloring", color: "#e879f9" },
  { id: "done", name: "Done", color: "#86efac" },
];

export const defaultPayments = [
  { id: "unpaid", name: "Not Paid", color: "#d4d4d8" },
  { id: "half", name: "50% Paid", color: "#60a5fa" },
  { id: "paid", name: "Paid", color: "#84cc16" },
];

const card = (title, stage = "waiting", payment = "") => ({
  id: id(),
  title,
  note: "",
  stage,
  payment,
});

export function createDefaultQueue() {
  return {
    showPayment: true,
    stages: defaultStages,
    payments: defaultPayments,
    lists: [
      {
        id: id(),
        title: "Queue L2D",
        kind: "queue",
        cards: [
          card("DE - Start Oct", "coloring", "paid"),
          card("CK - Start November", "sketch", "unpaid"),
          card("KC - Outfit Nov", "lineart", "half"),
          card("Chibi CC - Start Dec", "sketch", "half"),
          card("ON - Start Mid Dec"),
          card("RS - Start Jan"),
          card("L - Start Feb"),
        ],
      },
      {
        id: id(),
        title: "Queue Illust",
        kind: "queue",
        cards: [
          card("Lavatia 11 Character Colored Bust Sketch", "sketch", "paid"),
          card("Reactive PistDeChio", "waiting", "unpaid"),
          card("Reactive Taki", "waiting", "unpaid"),
        ],
      },
      {
        id: id(),
        title: "Finished L2D 2026",
        kind: "finished",
        cards: [
          "SM - Sept",
          "Mascot AFR 2",
          "Mascot AFR 1",
          "ME - Start Aug",
          "AFR Add Ons Toggle",
          "AFR 3",
          "AFR 2",
          "AFR 1",
        ].map((t) => card(t, "done", "paid")),
      },
      {
        id: id(),
        title: "Finished Illust",
        kind: "finished",
        cards: [
          "Gummy Clean Render",
          "Background Aquila",
          "Add Ons Alfiegato",
          "Reign Sinborne Bust Full Render 2",
          "Emote Zerion",
          "Emote KuroKami",
          "Emote Kazu",
          "AFR Mascot Graphic",
        ].map((t) => card(t, "done", "paid")),
      },
    ],
  };
}

const row = (name, ...prices) => ({ id: id(), name, prices, heading: false });
const heading = (name) => ({ id: id(), name, prices: [], heading: true });

export function createDefaultCommissions() {
  return {
    status: "waitlist",
    statusText: "Waitlist for Mar 2027",
    menus: [
      {
        id: id(),
        title: "L2D Model Art",
        currencies: ["USD (International)", "IDR (Local only)"],
        rows: [
          row("Full Body Model", "$450", "3,750JT"),
          heading("Add-ons"),
          row("+ Basic Expression", "$5", "30rb"),
          row("+ Hand pose", "$15", "150rb"),
          row("+ Leg pose", "$20", "180rb"),
          row("+ Additional Hairstyle", "$30", "350rb"),
          row("+ Small Asset", "$10", "75rb"),
          row("+ Big Asset", "$20", "180rb"),
          row("+ Mascot/Pet", "$60", "550rb"),
          row("+ Alternative Outfit", "$125", "1,2JT"),
          row("Designed by me", "$60+", "500rb+"),
        ],
        includes: [
          "Fully rendered full body model",
          "4 basic expressions",
          "Active update and communication",
          "Rig-ready PSD file of your model",
        ],
        note: "*Rigging is not included",
        images: [],
      },
    ],
    terms: [
      "I have the right to decline the commission if I can't fulfill the request.",
      "Provide clear visual references for your character. Feel free to send as many as needed.",
      "Preferred full payment upfront through PayPal / Local Bank (ID). Notify me for split payments (50% after sketch, 50% when the model is done).",
      "I will actively update you with WIPs in the sketch and render phases, or when a specific part is done. You may ask about the progress.",
      "Free revisions at the sketch phase; big revisions at the rendering phase have an additional charge.",
      "Mistakes on my part will be fixed for free, but not if they were caused by unclear references sent by the commissioner.",
      "The delivery date depends on the complexity of the design. If there's a tight deadline, please tell me beforehand (a rush fee might apply).",
      "Do not use my art for AI or NFTs.",
      "I have the right to use the artwork in my portfolio and on social media to promote my work. Commissioners may use the work for personal use and streams, but may not monetize it unless it was made and paid for commercial use.",
      "Please credit me as the artist of your commissioned work.",
      "No refunds unless I cancel your commission.",
    ],
    contact:
      "Interested in commissioning me? DM me on X / IG / Discord ♡  (X: @hunnipoffie · Discord: @hunhunni_.)",
  };
}
