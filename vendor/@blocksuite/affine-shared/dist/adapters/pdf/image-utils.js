/**
 * Image dimension utilities
 */
import { MAX_PAPER_HEIGHT, MAX_PAPER_WIDTH } from './utils.js';
/**
 * Calculate image dimensions respecting props, original size, and paper constraints
 */
export function calculateImageDimensions(blockWidth, blockHeight, originalWidth, originalHeight) {
    let targetWidth = blockWidth && blockWidth > 0
        ? blockWidth
        : originalWidth && originalWidth > 0
            ? originalWidth
            : undefined;
    let targetHeight = blockHeight && blockHeight > 0
        ? blockHeight
        : originalHeight && originalHeight > 0
            ? originalHeight
            : undefined;
    if (!targetWidth && !targetHeight) {
        return {};
    }
    if (targetWidth && targetWidth > MAX_PAPER_WIDTH) {
        const ratio = MAX_PAPER_WIDTH / targetWidth;
        targetWidth = MAX_PAPER_WIDTH;
        if (targetHeight) {
            targetHeight = targetHeight * ratio;
        }
    }
    if (targetHeight && targetHeight > MAX_PAPER_HEIGHT) {
        const ratio = MAX_PAPER_HEIGHT / targetHeight;
        targetHeight = MAX_PAPER_HEIGHT;
        if (targetWidth) {
            targetWidth = targetWidth * ratio;
        }
    }
    return {
        width: targetWidth,
        height: targetHeight,
    };
}
/**
 * Extract dimensions from SVG
 */
export function extractSvgDimensions(svgText) {
    const widthMatch = svgText.match(/width\s*=\s*["']?(\d+(?:\.\d+)?)/i);
    const heightMatch = svgText.match(/height\s*=\s*["']?(\d+(?:\.\d+)?)/i);
    const viewBoxMatch = svgText.match(/viewBox\s*=\s*["']?\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
    let width;
    let height;
    if (widthMatch) {
        width = parseFloat(widthMatch[1]);
    }
    if (heightMatch) {
        height = parseFloat(heightMatch[1]);
    }
    if ((!width || !height) && viewBoxMatch) {
        const viewBoxWidth = parseFloat(viewBoxMatch[1]);
        const viewBoxHeight = parseFloat(viewBoxMatch[2]);
        if (!width)
            width = viewBoxWidth;
        if (!height)
            height = viewBoxHeight;
    }
    return { width, height };
}
/**
 * Extract dimensions from JPEG/PNG using Image API
 */
export async function extractImageDimensions(blob) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        const timeout = setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve({});
        }, 5000);
        img.onload = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            resolve({});
        };
        img.src = url;
    });
}
