// Time-of-day moods: the sky behind the page and the colors the scenery takes on.

export const moods = {
  day: {
    label: "Day",
    sky: "linear-gradient(180deg, #9fd3ff 0%, #cfe9ff 45%, #fff0f6 100%)",
    sun: { color: "#fff3b0", glow: "#ffe58a", x: "12%", y: "14%", size: 110 },
    cloud: "#ffffff",
    hills: ["#bfe6b5", "#a4d89c", "#86c47f"],
    sakura: { trunk: "#7a5446", blossoms: ["#ffc4d6", "#ffadc8", "#ff94b8"] },
    maple: { trunk: "#6b4632", blossoms: ["#ff9f43", "#ff6b3d", "#ffc65c"] },
    pine: { tree: "#2f6f5a", snow: "#ffffff" },
    city: { buildings: ["#8fb3d9", "#6f95c2"], windows: "#e8f4ff", lit: 0.15 },
    mountains: ["#a9c7e8", "#7fa6cf", "#5f86b3"],
    beach: { sand: "#f6deb0", palmTrunk: "#9a7048", palmLeaves: "#3f9a5e" },
    rainbow: 0.55,
    water: ["#7cc6f2", "#4fa8e0"],
  },
  dawn: {
    label: "Dawn",
    sky: "linear-gradient(180deg, #c9e8ff 0%, #e3d4ff 50%, #ffd1e8 100%)",
    sun: { color: "#fff1d6", glow: "#ffd6e8", x: "80%", y: "62%", size: 120 },
    cloud: "#fff7fb",
    hills: ["#d9c8f0", "#c3aee6", "#ab93d8"],
    sakura: { trunk: "#6e4f5c", blossoms: ["#ffd3e4", "#ffbcd6", "#f9a6c8"] },
    maple: { trunk: "#6e4f5c", blossoms: ["#ffb38a", "#ff9a8b", "#ffd28a"] },
    pine: { tree: "#5f6f9c", snow: "#ffffff" },
    city: { buildings: ["#b9a6d9", "#9c88c8"], windows: "#fff1c9", lit: 0.35 },
    mountains: ["#d4c3ef", "#b7a2e2", "#9b85d0"],
    beach: { sand: "#f7d9cf", palmTrunk: "#8a6a7a", palmLeaves: "#6a8f86" },
    rainbow: 0.4,
    water: ["#b7c9ff", "#9fb3f5"],
  },
  sunset: {
    label: "Sunset",
    sky: "linear-gradient(180deg, #2e1e4f 0%, #7b3f8c 30%, #ff7e8a 65%, #ffc27a 100%)",
    sun: { color: "#ffd38a", glow: "#ff9a6b", x: "70%", y: "70%", size: 170 },
    cloud: "#ffb3a7",
    hills: ["#6b3358", "#4a2548", "#2e1836"],
    sakura: { trunk: "#3b1f3a", blossoms: ["#ff9ec4", "#ff7fae", "#ffb8d4"] },
    maple: { trunk: "#3b1f2a", blossoms: ["#ff7a3d", "#e8452e", "#ffb347"] },
    pine: { tree: "#2b1838", snow: "#ffd9e1" },
    city: { buildings: ["#4a2548", "#2e1836"], windows: "#ffd27a", lit: 0.55 },
    mountains: ["#8a4a72", "#62335f", "#3d1f42"],
    beach: { sand: "#c9786a", palmTrunk: "#2e1630", palmLeaves: "#2e1630" },
    rainbow: 0,
    water: ["#ff8a7a", "#c9577a"],
  },
  night: {
    label: "Night",
    sky: "linear-gradient(180deg, #070b1f 0%, #141a3d 55%, #2a1f4f 100%)",
    moon: { color: "#fff6d8", glow: "#c9d4ff", x: "82%", y: "14%", size: 90 },
    cloud: "#2b3160",
    hills: ["#1c2148", "#141836", "#0b0e22"],
    sakura: { trunk: "#1d1530", blossoms: ["#e8b3f0", "#d08be0", "#f2cff7"] },
    maple: { trunk: "#1d1530", blossoms: ["#c76b5a", "#a04a4f", "#e0a06b"] },
    pine: { tree: "#121a33", snow: "#dfe7ff" },
    city: { buildings: ["#1a1f45", "#10142e"], windows: "#ffe38a", lit: 0.7 },
    mountains: ["#232a5a", "#1a1f45", "#10142e"],
    beach: { sand: "#3b3a63", palmTrunk: "#0d1026", palmLeaves: "#0d1026" },
    rainbow: 0,
    water: ["#22306b", "#151d4a"],
  },
};

export const moodOptions = [
  { value: "none", label: "None (plain color)" },
  ...Object.entries(moods).map(([value, m]) => ({ value, label: m.label })),
  { value: "custom", label: "My own colors" },
];

export const decorOptions = [
  { value: "sakura", label: "Cherry blossom tree" },
  { value: "maple", label: "Autumn tree" },
  { value: "pines", label: "Snowy pines" },
  { value: "sun", label: "Sun" },
  { value: "moon", label: "Moon" },
  { value: "clouds", label: "Clouds" },
  { value: "hills", label: "Hills" },
  { value: "waves", label: "Waves" },
  { value: "city", label: "City skyline" },
  { value: "mountains", label: "Mountains" },
  { value: "beach", label: "Beach & palm" },
  { value: "rainbow", label: "Rainbow" },
];

export const particleOptions = [
  { value: "none", label: "None" },
  { value: "petals", label: "Sakura petals" },
  { value: "leaves", label: "Autumn leaves" },
  { value: "snow", label: "Snow" },
  { value: "stars", label: "Twinkling stars" },
  { value: "bubbles", label: "Bubbles" },
  { value: "hearts", label: "Hearts" },
  { value: "sparkles", label: "Sparkles" },
  { value: "glints", label: "White glints" },
  { value: "fireflies", label: "Fireflies" },
  { value: "shooting", label: "Shooting stars" },
  { value: "lanterns", label: "Floating lanterns" },
  { value: "confetti", label: "Confetti" },
];

/** Particles used to be a single choice; now she can mix several. */
export const particleList = (value) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(
    (v) => v && v !== "none",
  );

/** The mood used for scenery colors; "custom" and "none" borrow the day colors. */
export const moodFor = (scene) => moods[scene?.sky] ?? moods.day;
