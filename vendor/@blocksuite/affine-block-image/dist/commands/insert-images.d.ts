import type { Command } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
export declare const insertImagesCommand: Command<{
    selectedModels?: BlockModel[];
    removeEmptyLine?: boolean;
    placement?: 'after' | 'before';
}, {
    insertedImageIds: Promise<string[]>;
}>;
//# sourceMappingURL=insert-images.d.ts.map