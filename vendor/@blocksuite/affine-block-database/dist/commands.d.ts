import type { Command } from '@blocksuite/std';
import type { BlockModel, Store } from '@blocksuite/store';
export declare const insertDatabaseBlockCommand: Command<{
    selectedModels?: BlockModel[];
    viewType: string;
    place?: 'after' | 'before';
    removeEmptyLine?: boolean;
}, {
    insertedDatabaseBlockId: string;
}>;
export declare const initDatabaseBlock: (doc: Store, model: BlockModel, databaseId: string, viewType: string, isAppendNewRow?: boolean) => void;
//# sourceMappingURL=commands.d.ts.map