// The starting pages, built from editor blocks. They match the original hand-coded site.
import { makeBlock as b } from "../builder/make-block.js";

const page = (title, slug, inNav, description, content) => ({
  id: crypto.randomUUID(),
  title,
  slug,
  inNav,
  data: {
    root: {
      props: {
        title: `${title === "Home" ? "Poffie — Get to know me" : `${title} — Poffie`}`,
        description,
      },
    },
    content,
  },
});

// Words wrapped in <strong> show in the main color ("Highlight" in the editor).
const h1 = (text, highlight = "", textAfter = "") =>
  b("Heading", {
    text: highlight ? `${text}<strong>${highlight}</strong>${textAfter}` : text,
    level: "h1",
    size: "display",
  });
const h2 = (text) => b("Heading", { text, level: "h2", size: "lg" });
const lead = (text) =>
  b("Text", { text, size: "lg", color: "muted", narrow: true });
const moreLink = (label, link) =>
  b("Button", { label, link, style: "outline", size: "sm" });
const section = (content, props = {}) =>
  b("Section", { blocks: content, ...props });

const bio =
  "Bio goes here. Keep it friendly and short; visitors are here to get to know her, so this is the heart of the site.";
const facts = [
  { label: "Birthday", value: "—" },
  { label: "Height", value: "—" },
  { label: "Debut", value: "—" },
  { label: "Fan name", value: "—" },
  { label: "Streams", value: "Games, chatting" },
  { label: "Language", value: "—" },
];

export function createDefaultPages() {
  return [
    page(
      "Home",
      "/",
      false,
      "Hi, I'm Poffie! Get to know me, my streams, and my art.",
      [
        section(
          [
            b("Columns", {
              layout: "2",
              column1: [
                b("Badge", { label: "VTuber", style: "secondary", size: "lg" }),
                h1("Hi, I'm ", "Poffie", "!"),
                lead(
                  "A short welcome message goes here: who I am, what I stream, and why you should stay a while.",
                ),
                b("SocialLinks", { which: "featured", layout: "row" }),
              ],
              column2: [b("Image", { alt: "Character art" })],
            }),
          ],
          { spacing: "lg" },
        ),
        section([
          h2("About me"),
          b("Columns", {
            layout: "2-wide-left",
            verticalAlign: "start",
            column1: [b("Text", { text: bio })],
            column2: [b("Facts", { facts: facts.slice(0, 4), style: "list" })],
          }),
          moreLink("More about me", "/about"),
        ]),
        section([
          h2("Commission queue"),
          b("CommissionStatus"),
          b("CommissionQueue", { show: "queue", limit: 3 }),
          moreLink("See the full queue", "/queue"),
        ]),
        section([
          h2("Latest update"),
          b("Updates", { limit: 1 }),
          moreLink("All updates", "/updates"),
        ]),
        section(
          [
            h2("Fanart"),
            b("FanartGallery", { limit: 4, columns: 4, showFilter: false }),
            moreLink("See the gallery", "/fanart"),
          ],
          {
            spacing: "lg",
          },
        ),
      ],
    ),

    page(
      "About",
      "/about",
      true,
      "Get to know Poffie: profile, lore, likes, and FAQ.",
      [
        section(
          [
            b("Columns", {
              column1: [
                b("Badge", { label: "VTuber", style: "secondary", size: "lg" }),
                h1("About ", "Poffie"),
                lead(bio),
              ],
              column2: [b("Image", { alt: "Character art" })],
            }),
          ],
          { spacing: "lg" },
        ),
        section([
          h2("Profile"),
          b("Facts", { facts, style: "tiles", columns: 3 }),
        ]),
        section([
          h2("Lore"),
          b("Text", {
            text: "Character lore goes here: where she comes from, what she is, and the little story behind the model.",
            narrow: true,
          }),
        ]),
        section([
          h2("Likes & dislikes"),
          b("Columns", {
            verticalAlign: "start",
            column1: [
              b("Card", {
                padding: "md",
                blocks: [
                  b("Heading", { text: "Likes", level: "h3", size: "sm" }),
                  b("BadgeList", {
                    items: [
                      "Like one",
                      "Like two",
                      "Like three",
                      "Like four",
                    ].map((label) => ({ label })),
                    style: "primary",
                  }),
                ],
              }),
            ],
            column2: [
              b("Card", {
                padding: "md",
                blocks: [
                  b("Heading", { text: "Dislikes", level: "h3", size: "sm" }),
                  b("BadgeList", {
                    items: ["Dislike one", "Dislike two"].map((label) => ({
                      label,
                    })),
                    style: "outline",
                  }),
                ],
              }),
            ],
          }),
        ]),
        section(
          [
            h2("FAQ"),
            b("FAQ", {
              items: [
                {
                  question: "What does she stream?",
                  answer: "Answer goes here.",
                },
                {
                  question: "Can I draw fanart?",
                  answer: "Answer goes here, including which hashtag to use.",
                },
                {
                  question: "Can I clip the streams?",
                  answer: "Answer goes here.",
                },
              ],
            }),
          ],
          { spacing: "lg" },
        ),
      ],
    ),

    page(
      "Queue",
      "/queue",
      true,
      "Poffie's commission queue: what she's working on, what's next, and what's finished.",
      [
        section(
          [
            h1("Commission ", "queue"),
            lead(
              "Where every commission is right now. Top of each list = next up.",
            ),
            b("CommissionStatus"),
          ],
          { spacing: "lg" },
        ),
        section([b("CommissionQueue", { show: "all" })], { width: "wide" }),
        section([moreLink("Commission info & prices", "/commissions")]),
      ],
    ),

    page(
      "Commissions",
      "/commissions",
      true,
      "Poffie's commission info: prices, what's included, and terms of service.",
      [
        section(
          [
            h1("Commission ", "info"),
            b("CommissionStatus"),
            lead("Please read everything before reaching out ♡"),
          ],
          { spacing: "lg" },
        ),
        section([b("CommissionPrices")]),
        section([h2("⟡ Terms of Service ⟡"), b("CommissionTerms")]),
        section([moreLink("See the queue", "/queue")]),
      ],
    ),

    page(
      "Updates",
      "/updates",
      true,
      "News, events, milestones, and schedule changes from Poffie.",
      [
        section(
          [
            h1("Updates"),
            lead("News, events, milestones, and schedule changes."),
            b("Updates"),
          ],
          { width: "narrow", spacing: "lg" },
        ),
      ],
    ),

    page(
      "Fanart",
      "/fanart",
      true,
      "Fanart of Poffie from the community, with credit to every artist.",
      [
        section(
          [
            h1("Fanart"),
            lead(
              "Art made by the community. Every piece is credited to its artist; tap a name to see more of their work. Post yours with #PoffieArt for a chance to be featured.",
            ),
            b("FanartGallery", { columns: 4, showFilter: true }),
          ],
          { spacing: "lg" },
        ),
      ],
    ),

    page(
      "Links",
      "/links",
      true,
      "All of Poffie's official accounts in one place.",
      [
        section(
          [
            b("Image", {
              alt: "Avatar",
              shape: "circle",
              frame: "square",
              size: 30,
            }),
            b("Heading", { text: "Poffie", level: "h1", size: "lg" }),
            b("Text", { text: "VTuber", color: "muted" }),
            b("SocialLinks", { which: "all", layout: "list", size: "lg" }),
            b("Text", {
              text: "These are my only official accounts. For business inquiries, see the Contact page.",
              size: "sm",
              color: "muted",
            }),
          ],
          { width: "narrow", spacing: "lg", gap: "md", align: "center" },
        ),
      ],
    ),

    page(
      "Contact",
      "/contact",
      true,
      "How to contact Poffie for business inquiries, and where fans can say hi.",
      [
        section(
          [
            h1("Contact"),
            lead(
              "Business inquiries go by email. For everything else, come say hi on stream or in Discord!",
            ),
            b("Columns", {
              verticalAlign: "start",
              column1: [
                b("Card", {
                  padding: "lg",
                  gap: "md",
                  blocks: [
                    b("Heading", { text: "Business inquiries", size: "md" }),
                    b("Text", {
                      text: "Sponsorships, collaborations, commissions, and other work. Please include:",
                    }),
                    b("Text", {
                      text: "• Who you are and the company or project\n• What you'd like to do together\n• Dates, deadlines, and budget if you have them",
                    }),
                    b("Button", {
                      label: "Email me",
                      link: "mailto:business@example.com",
                      style: "primary",
                    }),
                    b("Text", {
                      text: "business@example.com",
                      size: "sm",
                      color: "muted",
                    }),
                  ],
                }),
              ],
              column2: [
                b("Card", {
                  style: { radius: "theme", borderWidth: 1 },
                  padding: "lg",
                  gap: "md",
                  blocks: [
                    b("Heading", { text: "Fans", size: "md" }),
                    b("Text", {
                      text: "The email above is for business only. The best places to talk to me are chat during streams and the Discord server.",
                    }),
                    b("Text", {
                      text: "Made fanart? Post it with #PoffieArt.",
                    }),
                    b("SocialLinks"),
                  ],
                }),
              ],
            }),
          ],
          { spacing: "lg" },
        ),
      ],
    ),
  ];
}
