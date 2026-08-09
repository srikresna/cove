import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export interface SelectionRect {
    width: number;
    height: number;
    top: number;
    left: number;
    transparent?: boolean;
}
export declare const AFFINE_DOC_REMOTE_SELECTION_WIDGET = "affine-doc-remote-selection-widget";
export declare class AffineDocRemoteSelectionWidget extends WidgetComponent {
    static styles: import("lit").CSSResult;
    private accessor _selections;
    private readonly _abortController;
    private _remoteColorManager;
    private readonly _remoteSelections;
    private readonly _resizeObserver;
    private get _config();
    private get _container();
    private get _containerRect();
    private get _selectionManager();
    private _getTextRange;
    private _getCursorRect;
    private readonly _getSelectionRect;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private readonly _updateSelections;
    private readonly _updateSelectionsThrottled;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_DOC_REMOTE_SELECTION_WIDGET]: AffineDocRemoteSelectionWidget;
    }
}
//# sourceMappingURL=doc-remote-selection.d.ts.map