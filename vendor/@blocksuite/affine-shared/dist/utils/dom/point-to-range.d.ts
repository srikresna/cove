declare global {
    interface Document {
        caretPositionFromPoint(x: number, y: number): {
            offsetNode: Node;
            offset: number;
        } | null;
    }
}
/**
 * A wrapper for the browser's `caretPositionFromPoint` and `caretRangeFromPoint`,
 * but adapted for different browsers.
 */
export declare function caretRangeFromPoint(clientX: number, clientY: number): Range | null;
export declare function resetNativeSelection(range: Range | null): void;
export declare function getCurrentNativeRange(selection?: Selection | null): Range | null;
export declare const api: {
    caretRangeFromPoint: typeof caretRangeFromPoint;
    resetNativeSelection: typeof resetNativeSelection;
};
export declare function handleNativeRangeAtPoint(x: number, y: number): void;
//# sourceMappingURL=point-to-range.d.ts.map