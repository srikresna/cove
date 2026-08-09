/**
 * Pure utility functions for PDF adapter
 */
export declare const BLOCK_CHILDREN_CONTAINER_PADDING_LEFT = 24;
export declare const MAX_PAPER_WIDTH = 550;
export declare const MAX_PAPER_HEIGHT = 800;
export declare const PDF_COLORS: {
    /** Primary link color */
    readonly link: "#0066cc";
    /** Primary text color */
    readonly text: "#333333";
    /** Secondary/muted text color */
    readonly textMuted: "#666666";
    /** Tertiary/disabled text color */
    readonly textDisabled: "#999999";
    /** Border/divider color */
    readonly border: "#cccccc";
    /** Code block background */
    readonly codeBackground: "#f5f5f5";
    /** Card/container background */
    readonly cardBackground: "#f9f9f9";
};
/**
 * Table layout with no borders (for custom styled containers)
 */
export declare const TABLE_LAYOUT_NO_BORDERS: {
    readonly hLineWidth: () => number;
    readonly vLineWidth: () => number;
    readonly paddingLeft: () => number;
    readonly paddingRight: () => number;
    readonly paddingTop: () => number;
    readonly paddingBottom: () => number;
};
/**
 * Generate placeholder text for images that cannot be rendered
 */
export declare function getImagePlaceholder(caption?: string): string;
/**
 * Check if text content has meaningful content
 */
export declare function hasTextContent(textContent: string | Array<string | {
    text: string;
    [key: string]: any;
}>): boolean;
/**
 * Convert text content array to plain string
 */
export declare function textContentToString(textContent: string | Array<string | {
    text: string;
    [key: string]: any;
}>): string;
//# sourceMappingURL=utils.d.ts.map