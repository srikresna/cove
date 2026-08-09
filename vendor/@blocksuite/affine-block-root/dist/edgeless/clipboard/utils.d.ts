import { Bound } from '@blocksuite/global/gfx';
import type { BlockStdScope } from '@blocksuite/std';
import { type GfxModel, type SerializedElement } from '@blocksuite/std/gfx';
import { type BlockSnapshot } from '@blocksuite/store';
export declare function createNewPresentationIndexes(raw: (SerializedElement | BlockSnapshot)[], std: BlockStdScope): Map<string, string>;
export declare function prepareClipboardData(selectedAll: GfxModel[], std: BlockStdScope): Promise<{
    snapshot: (SerializedElement | {
        type: "block";
        id: string;
        flavour: string;
        version?: number;
        props: Record<string, unknown>;
        children: BlockSnapshot[];
    })[];
    blobs: Record<string, import("@blocksuite/affine-shared/adapters").FileSnapshot>;
}>;
export declare function isPureFileInClipboard(clipboardData: DataTransfer): boolean;
export declare function tryGetSvgFromClipboard(clipboardData: DataTransfer): File | null;
export declare function edgelessElementsBoundFromRawData(elementsRawData: (SerializedElement | BlockSnapshot)[]): Bound;
//# sourceMappingURL=utils.d.ts.map