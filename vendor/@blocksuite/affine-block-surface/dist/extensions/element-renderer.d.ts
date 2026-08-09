import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { GfxLocalElementModel, GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import type { ExtensionType } from '@blocksuite/store';
import type { ElementRenderer } from '../renderer/elements';
export declare const ElementRendererIdentifier: ServiceIdentifier<unknown> & (<U extends unknown = unknown>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare const ElementRendererExtension: <T extends GfxPrimitiveElementModel | GfxLocalElementModel>(id: string, renderer: ElementRenderer<T>) => ExtensionType & {
    identifier: ServiceIdentifier<ElementRenderer<T>>;
};
//# sourceMappingURL=element-renderer.d.ts.map