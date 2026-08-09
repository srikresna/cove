export declare function calculateTextLength(text: Text): number;
type InlineRootTextCache = {
    dirty: boolean;
    observer: MutationObserver | null;
    textNodes: Text[];
    textNodeIndexMap: WeakMap<Text, number>;
    prefixLengths: number[];
    lineIndexMap: WeakMap<Element, number>;
};
export declare function invalidateInlineRootTextCache(rootElement: HTMLElement): void;
export declare function getInlineRootTextCache(rootElement: HTMLElement): InlineRootTextCache;
export declare function getTextNodesFromElement(element: Element): Text[];
export {};
//# sourceMappingURL=text.d.ts.map