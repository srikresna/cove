import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const AFFINE_EDGELESS_ZOOM_TOOLBAR_WIDGET = "affine-edgeless-zoom-toolbar-widget";
export declare class AffineEdgelessZoomToolbarWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    get edgeless(): import("@blocksuite/std").BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private accessor _hide;
}
export declare const edgelessZoomToolbarWidget: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=index.d.ts.map