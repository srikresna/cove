import type { Command } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
export declare const insertSurfaceRefBlockCommand: Command<{
    reference: string;
    place: 'after' | 'before';
    removeEmptyLine?: boolean;
    selectedModels?: BlockModel[];
}, {
    insertedSurfaceRefBlockId: string;
}>;
//# sourceMappingURL=commands.d.ts.map