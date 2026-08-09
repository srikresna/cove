import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const EDGELESS_NAVIGATOR_BLACK_BACKGROUND_WIDGET = "edgeless-navigator-black-background";
export declare class EdgelessNavigatorBlackBackgroundWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private _blackBackground;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    private get _slots();
    private _tryLoadBlackBackground;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    private accessor frame;
    private accessor show;
}
export declare const edgelessNavigatorBgWidget: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=navigator-bg-widget.d.ts.map