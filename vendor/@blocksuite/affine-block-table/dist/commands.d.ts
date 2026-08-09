import type { Command } from '@blocksuite/std';
import { type BlockModel } from '@blocksuite/store';
export declare const insertTableBlockCommand: Command<{
    place?: 'after' | 'before';
    removeEmptyLine?: boolean;
    selectedModels?: BlockModel[];
}, {
    insertedTableBlockId: string;
}>;
//# sourceMappingURL=commands.d.ts.map