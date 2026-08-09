/**
 * traverse the mindMapTree and construct the content string
 * like:
 * - Root
 *   - Child 1
 *     - Child 1.1
 *     - Child 1.2
 *   - Child 2
 *     - Child 2.1
 *     - Child 2.2
 *   - Child 3
 *     - Child 3.1
 *     - Child 3.2
 * @param elementModel - the mindmap element model
 * @param elements - the elements map
 * @returns the mindmap tree text
 */
export declare function getMindMapTreeText(elementModel: Record<string, unknown>, elements: Record<string, Record<string, unknown>>, options?: {
    prefix: string;
    repeat: number;
}): string;
//# sourceMappingURL=utils.d.ts.map