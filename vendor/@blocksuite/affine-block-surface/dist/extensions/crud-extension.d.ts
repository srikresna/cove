import type { SurfaceElementModelMap } from '@blocksuite/affine-model';
import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
import { type BlockModel, Extension } from '@blocksuite/store';
export declare const EdgelessCRUDIdentifier: import("@blocksuite/global/di").ServiceIdentifier<EdgelessCRUDExtension> & (<U extends EdgelessCRUDExtension = EdgelessCRUDExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class EdgelessCRUDExtension extends Extension {
    readonly std: BlockStdScope;
    constructor(std: BlockStdScope);
    static setup(di: Container): void;
    private get _gfx();
    private get _surface();
    deleteElements: (elements: GfxModel[]) => void;
    addBlock: (flavour: string, props: Record<string, unknown>, parentId?: string | BlockModel, parentIndex?: number) => string;
    addElement: <T extends Record<string, unknown>>(type: string, props: T) => string | undefined;
    updateElement: (id: string, props: Record<string, unknown>) => void;
    getElementById(id: string): GfxModel | null;
    getElementsByType<K extends keyof SurfaceElementModelMap>(type: K): SurfaceElementModelMap[K][];
    removeElement(id: string | GfxModel): void;
}
//# sourceMappingURL=crud-extension.d.ts.map