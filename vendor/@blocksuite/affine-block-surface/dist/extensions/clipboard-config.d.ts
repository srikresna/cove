import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { type BlockSnapshot, Extension, type Store } from '@blocksuite/store';
export type ClipboardConfigCreationContext = {
    /**
     * element old id to new id
     */
    oldToNewIdMap: Map<string, string>;
    /**
     * element old id to new layer index
     */
    originalIndexes: Map<string, string>;
    /**
     * frame old id to new presentation index
     */
    newPresentationIndexes: Map<string, string>;
};
export declare const EdgelessClipboardConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<EdgelessClipboardConfig> & (<U extends EdgelessClipboardConfig = EdgelessClipboardConfig>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare abstract class EdgelessClipboardConfig extends Extension {
    readonly std: BlockStdScope;
    static key: string;
    constructor(std: BlockStdScope);
    get surface(): import("..").SurfaceBlockComponent | null;
    get crud(): import("./crud-extension").EdgelessCRUDExtension;
    onBlockSnapshotPaste: (snapshot: BlockSnapshot, doc: Store, parent?: string, index?: number) => Promise<string | null>;
    abstract createBlock(snapshot: BlockSnapshot, context: ClipboardConfigCreationContext): string | null | Promise<string | null>;
    static setup(di: Container): void;
}
//# sourceMappingURL=clipboard-config.d.ts.map