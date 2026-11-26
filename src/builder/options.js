// Choices shown in the editor, and the Tailwind classes each choice turns into.
// Classes are written out in full so Tailwind can find them.

const option = (label, value) => ({ label, value });

export const backgroundOptions = [
  option("None", "none"),
  option("Page background", "base-100"),
  option("Card background", "base-200"),
  option("Border color", "base-300"),
  option("Main color", "primary"),
  option("Second color", "secondary"),
  option("Accent color", "accent"),
];
export const backgroundClass = {
  none: "",
  "base-100": "bg-base-100",
  "base-200": "bg-base-200",
  "base-300": "bg-base-300",
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  accent: "bg-accent text-accent-content",
};

export const textColorOptions = [
  option("Default", "default"),
  option("Main color", "primary"),
  option("Second color", "secondary"),
  option("Accent color", "accent"),
  option("Faded", "muted"),
];
export const textColorClass = {
  default: "",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  muted: "opacity-70",
};

export const alignOptions = [
  option("Left", "left"),
  option("Center", "center"),
  option("Right", "right"),
];
export const textAlignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
export const justifyClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export const widthOptions = [
  option("Narrow", "narrow"),
  option("Normal", "normal"),
  option("Wide", "wide"),
  option("Full width", "full"),
];
export const widthClass = {
  narrow: "max-w-3xl",
  normal: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

export const spacingOptions = [
  option("None", "none"),
  option("Small", "sm"),
  option("Medium", "md"),
  option("Large", "lg"),
  option("Extra large", "xl"),
];
export const paddingYClass = {
  none: "py-0",
  sm: "py-6",
  md: "py-10",
  lg: "py-16",
  xl: "py-24",
};
export const paddingClass = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};
export const gapClass = {
  none: "gap-0",
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};
export const spacerClass = {
  none: "h-0",
  sm: "h-4",
  md: "h-8",
  lg: "h-16",
  xl: "h-24",
};

export const headingSizeOptions = [
  option("Small", "sm"),
  option("Medium", "md"),
  option("Large", "lg"),
  option("Extra large", "xl"),
  option("Huge", "display"),
];
export const headingSizeClass = {
  sm: "text-xl font-bold",
  md: "text-2xl font-extrabold",
  lg: "text-3xl font-extrabold",
  xl: "text-4xl font-extrabold",
  display: "text-5xl leading-tight font-extrabold",
};

export const textSizeOptions = [
  option("Small", "sm"),
  option("Normal", "md"),
  option("Large", "lg"),
];
export const textSizeClass = { sm: "text-sm", md: "text-base", lg: "text-lg" };

export const buttonStyleOptions = [
  option("Main color", "primary"),
  option("Second color", "secondary"),
  option("Accent color", "accent"),
  option("Outline", "outline"),
  option("Plain", "ghost"),
];
export const buttonStyleClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  outline: "btn-outline",
  ghost: "btn-ghost",
};
export const sizeOptions = [
  option("Small", "sm"),
  option("Medium", "md"),
  option("Large", "lg"),
];
export const buttonSizeClass = { sm: "btn-sm", md: "", lg: "btn-lg" };

export const badgeStyleOptions = [
  option("Main color", "primary"),
  option("Second color", "secondary"),
  option("Accent color", "accent"),
  option("Outline", "outline"),
];
export const badgeStyleClass = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  outline: "badge-outline",
};
export const badgeSizeClass = { sm: "badge-sm", md: "", lg: "badge-lg" };

export const columnCountOptions = [
  option("1", 1),
  option("2", 2),
  option("3", 3),
  option("4", 4),
];
/** Phones always get 1 or 2 columns; bigger screens get the chosen number. */
export const gridColsClass = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export const aspectOptions = [
  option("Square", "square"),
  option("Wide (16:9)", "video"),
  option("Tall (3:4)", "portrait"),
  option("Original", "auto"),
];
export const aspectClass = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
};

export const yesNo = [option("Yes", true), option("No", false)];
