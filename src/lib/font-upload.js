// Turns an uploaded font file into a font the site can use (stored with the site).

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
};

const readAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });

export async function fontFileToCustomFont(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!TYPES[ext])
    throw new Error("Please choose a font file: .woff2, .woff, .ttf or .otf.");
  if (file.size > MAX_BYTES)
    throw new Error("That font is too big (max 3 MB). Try the .woff2 version.");
  const name =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/[^\w ]/g, "")
      .trim()
      .slice(0, 40) || "My font";
  return {
    id: crypto.randomUUID().replaceAll("-", "").slice(0, 12),
    name,
    src: `data:${TYPES[ext]};base64,${await readAsBase64(file)}`,
  };
}
