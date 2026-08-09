import { BaseSelection } from '@blocksuite/store';
export declare class ImageSelection extends BaseSelection {
    static group: string;
    static type: string;
    static fromJSON(json: Record<string, unknown>): ImageSelection;
    equals(other: BaseSelection): boolean;
    toJSON(): Record<string, unknown>;
}
export declare const ImageSelectionExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=image.d.ts.map