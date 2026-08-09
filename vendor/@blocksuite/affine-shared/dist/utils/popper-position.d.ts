/**
 * Get the position of the popper element with flip.
 * return null if the reference rect is all zero.
 */
export declare function getPopperPosition(popper: {
    getBoundingClientRect: () => DOMRect;
}, reference: {
    getBoundingClientRect: () => DOMRect;
}, { gap, offsetY }?: {
    gap?: number;
    offsetY?: number;
}): {
    placement: "top" | "bottom";
    /**
     * The height is the available space height.
     *
     * Note: it's a max height, not the real height,
     * because sometimes the popper's height is smaller than the available space.
     */
    height: number;
    x: string;
    y: string;
} | null;
//# sourceMappingURL=popper-position.d.ts.map