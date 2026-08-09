import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const EDGELESS_DRAGGING_AREA_WIDGET = "edgeless-dragging-area-rect";
export declare class EdgelessDraggingAreaRectWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export declare const edgelessDraggingAreaWidget: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=edgeless-dragging-area-rect.d.ts.map