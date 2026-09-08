import { MESSAGES } from "../constants/messages";
import { ValidationError } from "../errors/AppError";

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const ICON_SIZE = 128;
const ICON_QUALITY = 0.85;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ValidationError(MESSAGES.WORKSPACE_ICON_INVALID));
    img.src = url;
  });
}

export async function processWorkspaceIcon(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new ValidationError(MESSAGES.WORKSPACE_ICON_INVALID);
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ValidationError(MESSAGES.WORKSPACE_ICON_TOO_LARGE);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) {
      throw new ValidationError(MESSAGES.WORKSPACE_ICON_INVALID);
    }
    const side = Math.min(width, height);
    const sx = (width - side) / 2;
    const sy = (height - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new ValidationError(MESSAGES.WORKSPACE_ICON_INVALID);
    }
    ctx.drawImage(img, sx, sy, side, side, 0, 0, ICON_SIZE, ICON_SIZE);
    return canvas.toDataURL("image/webp", ICON_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
