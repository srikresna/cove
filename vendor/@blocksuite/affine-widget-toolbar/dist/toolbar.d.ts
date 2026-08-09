import { EditorToolbar } from '@blocksuite/affine-components/toolbar';
import { ToolbarContext } from '@blocksuite/affine-shared/services';
import { type BlockComponent, WidgetComponent } from '@blocksuite/std';
import { type GfxController, type GfxModel } from '@blocksuite/std/gfx';
import type { ReferenceElement, SideObject } from '@floating-ui/dom';
export declare const AFFINE_TOOLBAR_WIDGET = "affine-toolbar-widget";
export declare class AffineToolbarWidget extends WidgetComponent {
    static styles: import("lit").CSSResult;
    sideOptions$: import("@preact/signals-core").Signal<Partial<SideObject> | null>;
    referenceElement$: import("@preact/signals-core").Signal<(() => ReferenceElement | null) | null>;
    setReferenceElementWithRange(range: Range | null): void;
    setReferenceElementWithHtmlElement(element: Element | null): void;
    setReferenceElementWithBlocks(blocks: BlockComponent[]): void;
    setReferenceElementWithElements(gfx: GfxController, elements: GfxModel[]): void;
    updateWithSurface(ctx: ToolbarContext, activated: boolean, elementIds: string[]): void;
    toolbar: EditorToolbar;
    get toolbarRegistry(): import("@blocksuite/affine-shared/services").ToolbarRegistryExtension;
    connectedCallback(): void;
}
//# sourceMappingURL=toolbar.d.ts.map