import type { BlockSelection, Command, TextSelection } from '@blocksuite/std';
export interface SelectionRect {
    width: number;
    height: number;
    top: number;
    left: number;
    /**
     * The block id that the rect is in. Only available for block selections.
     */
    blockId?: string;
}
export declare const getSelectionRectsCommand: Command<{
    currentTextSelection?: TextSelection;
    currentBlockSelections?: BlockSelection[];
    textSelection?: TextSelection;
    blockSelections?: BlockSelection[];
}, {
    selectionRects: SelectionRect[];
}>;
export declare function filterCoveringRects(rects: SelectionRect[]): SelectionRect[];
export declare function getRangeRects(range: Range, container: HTMLElement | null): SelectionRect[];
//# sourceMappingURL=get-selection-rects.d.ts.map