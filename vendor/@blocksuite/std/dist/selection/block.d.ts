import { BaseSelection } from '@blocksuite/store';
export declare class BlockSelection extends BaseSelection {
    static group: string;
    static type: string;
    static fromJSON(json: Record<string, unknown>): BlockSelection;
    equals(other: BaseSelection): boolean;
    toJSON(): Record<string, unknown>;
}
export declare const BlockSelectionExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=block.d.ts.map