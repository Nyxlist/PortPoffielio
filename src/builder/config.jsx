// The block library shown in the editor, and how a page is wrapped (theme, header, footer).
import { SiteChrome } from "../site/SiteChrome.jsx";
import { useSiteFrame } from "../site/live-site.js";

/** Wraps every page in the site frame, reading the theme from the live store. */
function RootFrame({ children, puck }) {
  const site = useSiteFrame(puck);
  if (!site?.pages) return children; // not loaded yet
  return (
    <SiteChrome
      site={site}
      currentSlug={puck.metadata.currentSlug}
      onNavigate={puck.isEditing ? puck.metadata.onNavigate : undefined}
    >
      {children}
    </SiteChrome>
  );
}
import { Card, Columns, Divider, Section, Spacer } from "./blocks/layout.jsx";
import { Badge, Button, ButtonRow, Heading, Text } from "./blocks/basic.jsx";
import {
  FanartGallery,
  SocialLinks,
  StreamSchedule,
  Updates,
} from "./blocks/content.jsx";
import { BadgeList, FAQ, Facts, VideoGrid } from "./blocks/lists.jsx";
import { Image } from "./blocks/image.jsx";
import {
  CommissionPrices,
  CommissionQueue,
  CommissionStatus,
  CommissionTerms,
} from "./blocks/commissions.jsx";
import { withStyle } from "./style/with-style.jsx";

const blocks = {
  Section: withStyle(Section, { backgroundImage: true }),
  Columns: withStyle(Columns),
  Card: withStyle(Card, {
    backgroundImage: true,
    defaultStyle: { bg: "theme:base-200", radius: "theme" },
  }),
  Spacer: withStyle(Spacer),
  Divider: withStyle(Divider),
  Heading: withStyle(Heading),
  Text: withStyle(Text),
  Button: withStyle(Button),
  ButtonRow: withStyle(ButtonRow),
  Image: withStyle(Image),
  Badge: withStyle(Badge),
  BadgeList: withStyle(BadgeList),
  StreamSchedule: withStyle(StreamSchedule),
  Updates: withStyle(Updates),
  FanartGallery: withStyle(FanartGallery),
  SocialLinks: withStyle(SocialLinks),
  Facts: withStyle(Facts),
  FAQ: withStyle(FAQ),
  VideoGrid: withStyle(VideoGrid),
  CommissionQueue: withStyle(CommissionQueue),
  CommissionStatus: withStyle(CommissionStatus),
  CommissionPrices: withStyle(CommissionPrices),
  CommissionTerms: withStyle(CommissionTerms),
};

// Each block knows its own name (used to find it on the page, e.g. when a picture is dropped on it).
for (const [name, block] of Object.entries(blocks)) block.typeName = name;

export const config = {
  categories: {
    layout: {
      title: "Layout",
      components: ["Section", "Columns", "Card", "Spacer", "Divider"],
    },
    basics: {
      title: "Text & media",
      components: [
        "Heading",
        "Text",
        "Button",
        "ButtonRow",
        "Image",
        "Badge",
        "BadgeList",
      ],
    },
    commissions: {
      title: "Commissions",
      components: [
        "CommissionQueue",
        "CommissionStatus",
        "CommissionPrices",
        "CommissionTerms",
      ],
    },
    content: {
      title: "Site content",
      components: [
        "StreamSchedule",
        "Updates",
        "FanartGallery",
        "SocialLinks",
        "Facts",
        "FAQ",
        "VideoGrid",
      ],
    },
  },
  components: blocks,
  root: {
    fields: {
      title: { type: "text", label: "Browser tab title" },
      description: {
        type: "textarea",
        label: "Description (shown in search results)",
      },
    },
    render: (props) => <RootFrame {...props} />,
  },
};
