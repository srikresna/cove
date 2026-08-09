import type { DataViewSelection } from '@blocksuite/data-view';
import { BaseSelection } from '@blocksuite/store';
export declare class DatabaseSelection extends BaseSelection {
    static group: string;
    static type: string;
    readonly viewSelection: DataViewSelection;
    get viewId(): string;
    constructor({ blockId, viewSelection, }: {
        blockId: string;
        viewSelection: DataViewSelection;
    });
    static fromJSON(json: Record<string, unknown>): DatabaseSelection;
    equals(other: BaseSelection): boolean;
    toJSON(): Record<string, unknown>;
}
export declare const DatabaseSelectionExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=selection.d.ts.map