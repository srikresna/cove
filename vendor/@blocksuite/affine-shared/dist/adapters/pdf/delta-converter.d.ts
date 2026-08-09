/**
 * Delta to PDF content converter
 */
/**
 * Extract text from delta operations, preserving inline properties
 * Returns normalized format: string if simple, array if complex (with inline styles)
 */
export declare function extractTextWithInline(props: Record<string, any>, configs: Map<string, string>): string | Array<string | {
    text: string;
    [key: string]: any;
}>;
//# sourceMappingURL=delta-converter.d.ts.map