/**
 * A utility class for building SVG path strings using command-based API.
 * Supports moveTo, lineTo, curveTo operations and can build complete path strings.
 */
export declare class SVGPathBuilder {
    private commands;
    /**
     * Move to a specific point without drawing
     */
    moveTo(x: number, y: number): this;
    /**
     * Draw a line to a specific point
     */
    lineTo(x: number, y: number): this;
    /**
     * Draw a cubic Bézier curve
     */
    curveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
    /**
     * Close the current path
     */
    closePath(): this;
    /**
     * Build the complete SVG path string
     */
    build(): string;
    /**
     * Clear all commands and reset the builder
     */
    clear(): this;
}
/**
 * Create SVG polygon points string for common shapes
 */
export declare class SVGShapeBuilder {
    /**
     * Generate diamond (rhombus) polygon points
     */
    static diamond(width: number, height: number, strokeWidth?: number): string;
    /**
     * Generate triangle polygon points
     */
    static triangle(width: number, height: number, strokeWidth?: number): string;
    /**
     * Generate diamond path using SVGPathBuilder
     */
    static diamondPath(width: number, height: number, strokeWidth?: number): string;
    /**
     * Generate triangle path using SVGPathBuilder
     */
    static trianglePath(width: number, height: number, strokeWidth?: number): string;
}
//# sourceMappingURL=svg-path.d.ts.map