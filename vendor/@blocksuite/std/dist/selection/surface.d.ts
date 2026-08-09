import { BaseSelection } from '@blocksuite/store';
export declare class SurfaceSelection extends BaseSelection {
    static group: string;
    static type: string;
    static recoverable: boolean;
    readonly editing: boolean;
    readonly elements: string[];
    readonly inoperable: boolean;
    constructor(blockId: string, elements: string[], editing: boolean, inoperable?: boolean);
    static fromJSON(json: Record<string, unknown>): SurfaceSelection;
    equals(other: BaseSelection): boolean;
    isEmpty(): boolean;
    toJSON(): Record<string, unknown>;
}
export declare const SurfaceSelectionExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=surface.d.ts.map