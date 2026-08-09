import type { OffsetList } from './types';
export declare const getTargetIndexByDraggingOffset: (offsets: OffsetList, draggingIndex: number, indicatorLeft: number) => {
    targetIndex: number;
    isForward: true;
} | {
    targetIndex: number;
    isForward: false;
} | {
    targetIndex: undefined;
    isForward: boolean;
};
//# sourceMappingURL=linear-move.d.ts.map