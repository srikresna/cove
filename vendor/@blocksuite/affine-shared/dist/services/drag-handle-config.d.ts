import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { Extension, type SliceSnapshot } from '@blocksuite/store';
export declare const DndApiExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<DNDAPIExtension> & (<U extends DNDAPIExtension = DNDAPIExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class DNDAPIExtension extends Extension {
    readonly std: BlockStdScope;
    mimeType: string;
    constructor(std: BlockStdScope);
    static setup(di: Container): void;
    decodeSnapshot(data: string): SliceSnapshot;
    encodeSnapshot(json: SliceSnapshot): string;
    fromEntity(options: {
        docId: string;
        flavour?: string;
        blockId?: string;
        props?: Record<string, unknown>;
    }): SliceSnapshot | null;
}
//# sourceMappingURL=drag-handle-config.d.ts.map