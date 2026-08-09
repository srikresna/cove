/**
 * Image dimension utilities
 */
/**
 * Calculate image dimensions respecting props, original size, and paper constraints
 */
export declare function calculateImageDimensions(blockWidth: number | undefined, blockHeight: number | undefined, originalWidth: number | undefined, originalHeight: number | undefined): {
    width?: number;
    height?: number;
};
/**
 * Extract dimensions from SVG
 */
export declare function extractSvgDimensions(svgText: string): {
    width?: number;
    height?: number;
};
/**
 * Extract dimensions from JPEG/PNG using Image API
 */
export declare function extractImageDimensions(blob: Blob): Promise<{
    width?: number;
    height?: number;
}>;
//# sourceMappingURL=image-utils.d.ts.map