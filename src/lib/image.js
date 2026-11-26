// Shrinks an uploaded image so pages stay small (default max 1600px on the long side), saved as WebP.
// WebP keeps transparency, so stickers with see-through backgrounds stay see-through.

const MAX_SIZE = 1600;
const QUALITY = 0.85;

export async function fileToResizedDataUrl(file, maxSize = MAX_SIZE) {
  if (!file.type.startsWith("image/"))
    throw new Error("Please choose an image file.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", QUALITY);
}
