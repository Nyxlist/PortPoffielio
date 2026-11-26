// Ready-made sections and page layouts she can add with one click, then change freely.
import { makeBlock as b } from "../builder/make-block.js";

const section = (blocks, props = {}) => b("Section", { blocks, ...props });
const h1 = (html) => b("Heading", { text: html, level: "h1", size: "display" });
const h2 = (text) => b("Heading", { text, level: "h2", size: "lg" });
const lead = (text) =>
  b("Text", { text, size: "lg", color: "muted", narrow: true });
const text = (t, props = {}) => b("Text", { text: t, ...props });
const button = (label, link, style = "outline", size = "sm") =>
  b("Button", { label, link, style, size });

export const sectionTemplates = [
  {
    id: "hero",
    name: "Hero",
    description:
      "Big hello with your name, a short intro, social buttons, and a picture.",
    build: () =>
      section(
        [
          b("Columns", {
            column1: [
              b("Badge", { label: "VTuber", style: "secondary", size: "lg" }),
              h1("Hi, I'm <strong>Your Name</strong>!"),
              lead("A short welcome message: who you are and what you stream."),
              b("SocialLinks"),
            ],
            column2: [b("Image", { alt: "Character art" })],
          }),
        ],
        { spacing: "lg" },
      ),
  },
  {
    id: "banner",
    name: "Big banner",
    description:
      "A colorful full-width banner with a title and a button. Add a backdrop picture in its Style.",
    build: () =>
      section(
        [
          h1("Something <strong>exciting</strong> is coming"),
          lead("Tell everyone about it here."),
          button("Find out more", "#", "primary", "lg"),
        ],
        {
          spacing: "xl",
          align: "center",
          style: { bg: "theme:primary", bgTo: "theme:secondary", bgAngle: 135 },
        },
      ),
  },
  {
    id: "picture-text",
    name: "Picture + text",
    description: "A picture next to a heading and a paragraph.",
    build: () =>
      section([
        b("Columns", {
          column1: [b("Image", { alt: "Picture", shape: "blob" })],
          column2: [
            h2("A little story"),
            text("Write a few sentences here. Click any text to change it."),
          ],
        }),
      ]),
  },
  {
    id: "about",
    name: "About + facts",
    description: "A short bio next to a list of quick facts.",
    build: () =>
      section([
        h2("About me"),
        b("Columns", {
          layout: "2-wide-left",
          verticalAlign: "start",
          column1: [text("Bio goes here.")],
          column2: [
            b("Facts", {
              facts: [
                { label: "Birthday", value: "—" },
                { label: "Fan name", value: "—" },
              ],
              style: "list",
            }),
          ],
        }),
      ]),
  },
  {
    id: "queue",
    name: "Commission queue",
    description: "Your commission progress board (edit it in Queue & comms).",
    build: () =>
      section([
        h2("Commission queue"),
        b("CommissionStatus"),
        b("CommissionQueue", { show: "queue" }),
      ]),
  },
  {
    id: "commissions",
    name: "Commission info",
    description: "Status, price lists, and terms of service.",
    build: () =>
      section([
        h2("Commission info"),
        b("CommissionStatus"),
        b("CommissionPrices"),
        h2("Terms of Service"),
        b("CommissionTerms"),
      ]),
  },
  {
    id: "schedule",
    name: "Stream schedule",
    description: "Your weekly streams (edit them in Content).",
    build: () =>
      section([h2("Stream schedule"), b("StreamSchedule", { columns: 3 })]),
  },
  {
    id: "updates",
    name: "Latest updates",
    description: "Your newest announcements (edit them in Content).",
    build: () =>
      section([h2("Latest updates"), b("Updates", { limit: 3 })], {
        width: "narrow",
      }),
  },
  {
    id: "fanart",
    name: "Fanart gallery",
    description:
      "Fanart with artist credits and a tag filter (edit it in Content).",
    build: () =>
      section([
        h2("Fanart"),
        b("FanartGallery", { columns: 4, showFilter: true }),
      ]),
  },
  {
    id: "links",
    name: "Link list",
    description: "A centered avatar and big buttons for all your accounts.",
    build: () =>
      section(
        [
          b("Image", {
            alt: "Avatar",
            shape: "circle",
            frame: "square",
            size: 30,
          }),
          b("Heading", { text: "Your Name", level: "h2", size: "lg" }),
          b("SocialLinks", { which: "all", layout: "list", size: "lg" }),
        ],
        { width: "narrow", align: "center", gap: "md" },
      ),
  },
  {
    id: "cards",
    name: "Two cards",
    description: "Two boxes side by side, e.g. for business and fans.",
    build: () =>
      section([
        b("Columns", {
          verticalAlign: "start",
          column1: [
            b("Card", {
              padding: "lg",
              gap: "md",
              blocks: [
                b("Heading", { text: "First card", size: "md" }),
                text("Some text."),
              ],
            }),
          ],
          column2: [
            b("Card", {
              padding: "lg",
              gap: "md",
              blocks: [
                b("Heading", { text: "Second card", size: "md" }),
                text("Some text."),
              ],
            }),
          ],
        }),
      ]),
  },
  {
    id: "quote",
    name: "Quote",
    description: "A big highlighted sentence in a soft box.",
    build: () =>
      section(
        [
          b("Card", {
            padding: "xl",
            style: { bg: "theme:base-200", radius: "xl", shadow: "md" },
            blocks: [
              b("Heading", {
                text: "“A favorite quote or <strong>catchphrase</strong>.”",
                size: "xl",
                align: "center",
              }),
            ],
          }),
        ],
        { width: "narrow" },
      ),
  },
  {
    id: "faq",
    name: "FAQ",
    description: "Questions that open when clicked.",
    build: () => section([h2("FAQ"), b("FAQ")], { width: "narrow" }),
  },
];

const bySectionId = Object.fromEntries(sectionTemplates.map((t) => [t.id, t]));
const sections = (...ids) => ids.map((id) => bySectionId[id].build());

export const pageTemplates = [
  {
    id: "blank",
    name: "Blank",
    build: (title) => [section([h1(title)], { spacing: "lg" })],
  },
  {
    id: "landing",
    name: "Landing page",
    build: () => sections("hero", "banner", "queue", "fanart"),
  },
  {
    id: "about",
    name: "About me",
    build: () => sections("picture-text", "about", "faq"),
  },
  {
    id: "gallery",
    name: "Gallery",
    build: (title) => [
      section(
        [h1(title), b("FanartGallery", { columns: 4, showFilter: true })],
        { spacing: "lg" },
      ),
    ],
  },
  { id: "links", name: "Link list", build: () => sections("links") },
  {
    id: "contact",
    name: "Contact",
    build: (title) => [
      section([h1(title)], { spacing: "lg" }),
      ...sections("cards"),
    ],
  },
];
