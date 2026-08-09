import type { Command } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
export declare const insertLatexBlockCommand: Command<{
    latex?: string;
    place?: 'after' | 'before';
    removeEmptyLine?: boolean;
    selectedModels?: BlockModel[];
}, {
    insertedLatexBlockId: Promise<string>;
}>;
//# sourceMappingURL=commands.d.ts.map