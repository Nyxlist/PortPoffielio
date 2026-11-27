# VTuber website

A public "get to know me" website for a VTuber, with a drag-and-drop editor at `/admin` so she can design every page herself: blocks, layout, theme, pages, and menu.

**Live:** https://nyxlist.github.io/PortPoffielio/ · **Editor:** https://nyxlist.github.io/PortPoffielio/admin

## Stack

- **React + Vite**: one app; the public site at every address and the editor at `/admin`
- **Puck** (`@puckeditor/core`, MIT): the drag-and-drop page editor
- **Tailwind CSS v4 + daisyUI 5**: styling. daisyUI adds readable component classes (`btn`, `card`, `badge`)
- **IndexedDB** (via `idb-keyval`): where the site is saved for now; **Supabase** replaces it later
- **Prettier** with the Tailwind plugin: consistent formatting and class order

## Getting started

Requires Node 20.19+ or 22.12+.

```bash
npm install
npm run dev            # site: http://localhost:5173   editor: http://localhost:5173/admin
```

| Script            | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Local dev server with hot reload   |
| `npm run build`   | Production build into `dist/`      |
| `npm run preview` | Serve the production build locally |
| `npm run format`  | Format all files with Prettier     |

## Using the editor (`/admin`)

A **guided tour** opens on the first visit (replay it any time with **? Help**). Side panels float over the page preview, so the page never jumps when they open.

- **+ Add blocks**: the block library. **✨ Ready-made sections** at the top adds a finished section (hero, banner, gallery, …). Or drag single blocks; _Layout_ blocks (Section, Columns, Card) hold other blocks.
- **Click a block** to select it; its **Block settings** open by themselves. Headings and text can be typed straight onto the page; in headings, select words and press **Highlight** to color them.
- The black bar on a selected block: **⠿ Move** (drag to move), **↰** (select the box around it), duplicate, delete. Backspace/Delete only erase text, never whole blocks.
- **Style** (every block): **Placement** (free placement on/off, X/Y/width/height, turn, layer), background color or gradient, backdrop picture (Sections and Cards), text color, corners (presets or any size), border, shadow/glow, **Size & spacing** with slider + number + unit (px, %, rem, vw, vh): width, height, inner space (all sides or per axis), extra space above/below; see-through, tilt; **Text** (font, size, weight, letter spacing, line height, align, case, italic, outline, shadow); **Text fill** (gradient, or a picture shown through the letters); **Animation** (fade up, slide, pop, bounce, typewriter, blur in, float, wiggle, pulse, glow, rainbow, shake, flicker; plays on scroll-in, on hover, or loops; length and delay).
- **Free placement**: drop a picture file onto the page and it lands where it's dropped (Shift = add as a normal block; dropping on a picture replaces it). Any block can be switched to free placement in its Style. Free things are dragged on the page, resized from the edges/corner, and turned with the round handle (Shift snaps). Free things are positioned from the Section's content column (the same centered column as the normal blocks; design width 720/976/1232/1280 for narrow/normal/wide/full), stored in that frame's units, and scale with the column, so phones, tablets and desktops show the same layout (moving something in phone view moves it everywhere). Sections have an optional **Free area height** to make room. Things sticking out left/right are cut off so phones never scroll sideways.
- **Image**: upload (or drag-and-drop / paste into the picture box), crop (frame + click the focus point + zoom), size, position, shapes (rounded, circle, arch, hexagon, star, heart, blob), **mask with a picture** (see-through PNG or black & white; fit, size, position, swap), **blend with a second picture** (overlay, multiply, screen, soft light, color, …; strength), effects (brightness, color strength, contrast, hue shift, mirror, blur, black & white), optional link.
- **↶ / ↷**: undo and redo (also Ctrl+Z / Ctrl+Shift+Z).
- **Publish** saves the open page (open tabs of the site refresh by themselves). Theme, Content, and Pages changes save automatically.
- **Pages**: add (blank or from a template), rename, reorder, hide from the menu, change the address, delete.
- **Theme** (opens the _Theme maker_ side panel, changes show live): **Looks** (ready-made scenes and plain themes, plus **My themes**: save / apply / update / rename / delete her own looks), **Colors & fonts** (site name, colors, heading and text fonts, upload your own font, corners, page background picture), **Scene** (sky, scenery, built-in falling/floating effects, readability panel), **Falling & stickers** (her own falling/floating things: any emoji, text or picture with movement/amount/speed/size/spin; stickers pinned anywhere with size/see-through/bob/mirror), **Effects** (click bursts: sparkles, hearts, stars, petals, confetti, ripple, or her own; scroll: section reveal animations, progress bar, parallax). Click/scroll effects are off in the editor and for visitors who reduce motion.
- **Content**: shared lists (stream schedule, updates, fanart, social links). Every block that shows them updates.
- **Queue & comms** (full-screen dashboard, saves by itself): **Queue board** like her Trello (lists side by side; drag cards between lists and up/down, top = next up; progress step and payment label per card; "Next step →"; "✓ Finish" moves a card to the top of the first finished list; notes; delete), **Lists & labels** (queue/finished lists, progress steps with colors, payment labels, hide payment labels from the site), **Commission info** (open / waitlist / closed + text, price lists with any price columns, group titles, base includes, note, example pictures, terms of service, contact). Blocks: _Commission queue_ (board or stacked, progress bars), _Commission status_, _Commission prices_, _Terms of service_. Pages: **Queue** (`/queue`) and **Commissions** (`/commissions`).
- **Default look "Dreamweaver"** (from her Carrd): pink sky with white glints, Caprasimo headings, Plus Jakarta Sans text, white cards with a dotted border ("White card" panel), centered header with logo and pink pill buttons (Theme → Colors & fonts → Header).

## Structure

```text
index.html                 Single HTML entry
src/main.jsx               Shows the editor at /admin, otherwise the public site
src/site/SiteApp.jsx       Public site: finds the saved page for the address and renders it
src/site/SiteChrome.jsx    Theme wrapper, header with menu, footer (shared by site and editor preview)
src/site/scene/            Whole-page scene: sky moods, SVG scenery, falling/floating particles, her own things & stickers
src/site/effects/          Click bursts and scroll effects (reveal, progress bar, parallax)
src/editor/                The editor: Puck setup, header, guided tour, Pages/Theme/Content panels
src/builder/config.jsx     The block library (what she can drag in) and categories
src/builder/blocks/        Block definitions: layout, basic (text), image, content (shared lists), lists
src/builder/style/         Shared Style settings for every block (panel UI + CSS), text styles, animations, unit sliders
src/builder/free/          Free placement: frame scale (--k), draggable free items, editor bridge (free-store.js)
src/builder/options.js     Choices shown in the editor and the Tailwind classes they map to
src/data/                  The starting site (starter-site.json: her own version from the editor; pictures in public/starter/), page/section templates, queue & commission defaults
src/services/site-store.js Load/save the site (IndexedDB now; swap for Supabase later)
src/services/migrations.js Upgrades sites saved by older editor versions
src/lib/                   Theme → CSS variables, theme presets, font upload, image shrinking, safe URLs
src/styles/main.css        Tailwind, daisyUI, fonts, fallback theme
src/styles/free-and-text.css  Free placement, block text settings, block animations
```

### Adding a new block type

1. Add it to a file in `src/builder/blocks/` (`fields`, `defaultProps`, `render`).
2. Register it in `src/builder/config.jsx` (`components` and a category).
3. Only use the choices in `options.js` for colors and spacing, so pages stay on-theme and readable.


## Hosting note

The site is a single-page app: the host must serve `index.html` for every path (e.g. `/about`). Most static hosts have a "single-page app" / rewrite setting for this.

## Security

- `/admin` has **no login yet** and saves only in the browser it was used in. Don't put it online until Supabase login is added.
- All content is rendered as text by React; links only allow `http(s)`, `mailto`, and in-site paths, and images only uploads or web images.
- When Supabase is added: only the **publishable** key goes in `.env` (never the secret / `service_role` key), and writes are protected with Row Level Security, not by hiding the editor.
