import { type RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing, type TemplateResult } from 'lit';
export declare const AFFINE_EDGELESS_AUTO_CONNECT_WIDGET = "affine-edgeless-auto-connect-widget";
export declare class EdgelessAutoConnectWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private get _gfx();
    private get _crud();
    private get _viewport();
    private get _selection();
    private readonly _updateLabels;
    private _EdgelessOnlyLabels;
    private _getElementsAndCounts;
    private _initLabels;
    private _navigateToNext;
    private _navigateToPrev;
    private _NavigatorComponent;
    private _PageVisibleIndexLabels;
    private _setHostStyle;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): TemplateResult<1> | typeof nothing;
    private accessor _dragging;
    private accessor _edgelessOnlyNotesSet;
    private accessor _index;
    private accessor _pageVisibleElementsMap;
    private accessor _show;
}
export declare const autoConnectWidget: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-auto-connect-widget': EdgelessAutoConnectWidget;
    }
}
//# sourceMappingURL=index.d.ts.map