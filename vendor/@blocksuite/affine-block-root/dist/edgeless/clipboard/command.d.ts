import { type IVec } from '@blocksuite/global/gfx';
import type { Command } from '@blocksuite/std';
import { type GfxBlockElementModel, type GfxPrimitiveElementModel, type SerializedElement } from '@blocksuite/std/gfx';
import { type BlockSnapshot } from '@blocksuite/store';
interface Input {
    elementsRawData: (SerializedElement | BlockSnapshot)[];
    pasteCenter?: IVec;
}
type CreatedElements = {
    canvasElements: GfxPrimitiveElementModel[];
    blockModels: GfxBlockElementModel[];
};
interface Output {
    createdElementsPromise: Promise<CreatedElements>;
}
export declare const createElementsFromClipboardDataCommand: Command<Input, Output>;
export {};
//# sourceMappingURL=command.d.ts.map