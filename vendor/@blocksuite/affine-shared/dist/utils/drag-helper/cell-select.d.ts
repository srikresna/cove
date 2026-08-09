import type { OffsetList } from './types';
type CellOffsets = {
    rows: OffsetList;
    columns: OffsetList;
};
export declare const domToOffsets: (element: HTMLElement, rowSelector: string, cellSelector: string) => CellOffsets | undefined;
export declare const getIndexByPosition: (positions: OffsetList, offset: number, reverse?: boolean) => number;
export declare const getRangeByPositions: (positions: OffsetList, start: number, end: number) => {
    start: number;
    end: number;
};
export declare const getAreaByOffsets: (offsets: CellOffsets, top: number, bottom: number, left: number, right: number) => {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export {};
//# sourceMappingURL=cell-select.d.ts.map