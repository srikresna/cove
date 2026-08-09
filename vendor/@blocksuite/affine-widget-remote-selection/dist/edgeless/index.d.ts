import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const AFFINE_EDGELESS_REMOTE_SELECTION_WIDGET = "affine-edgeless-remote-selection-widget";
export declare class EdgelessRemoteSelectionWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private _remoteColorManager;
    private readonly _updateOnElementChange;
    private readonly _updateRemoteCursor;
    private readonly _updateRemoteRects;
    private readonly _updateTransform;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get surface(): import("@blocksuite/std/gfx").SurfaceBlockModel | null;
    connectedCallback(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private accessor _remoteCursors;
    private accessor _remoteRects;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_EDGELESS_REMOTE_SELECTION_WIDGET]: EdgelessRemoteSelectionWidget;
    }
}
//# sourceMappingURL=index.d.ts.map