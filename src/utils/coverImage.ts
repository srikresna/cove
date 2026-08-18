import { MESSAGES } from "../constants/messages";
import { ValidationError } from "../errors/AppError";

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_COVER_WIDTH = 2400;
const MAX_COVER_PIXELS = 30_000_000;
const COVER_QUALITY = 0.85;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ValidationError(MESSAGES.COVER_INVALID_IMAGE));
    img.src = url;
  });
}

export async function processCoverImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new ValidationError(MESSAGES.COVER_INVALID_IMAGE);
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ValidationError(MESSAGES.COVER_TOO_LARGE);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) {
      throw new ValidationError(MESSAGES.COVER_INVALID_IMAGE);
    }
    const scale = Math.min(
      1,
      MAX_COVER_WIDTH / width,
      Math.sqrt(MAX_COVER_PIXELS / (width * height)),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new ValidationError(MESSAGES.COVER_INVALID_IMAGE);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", COVER_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
