import { type PopupTarget } from '@blocksuite/affine-components/context-menu';
import { type DataViewUILogicBase } from '../../../../core/index.js';
import { WidgetBase } from '../../../../core/widget/widget-base.js';
export declare class DataViewHeaderToolsViewOptions extends WidgetBase {
    static styles: import("lit").CSSResult;
    clickMoreAction: (e: MouseEvent) => void;
    openMoreAction: (target: PopupTarget) => void;
    render(): import("lit-html").TemplateResult<1> | undefined;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-header-tools-view-options': DataViewHeaderToolsViewOptions;
    }
}
export declare const popViewOptions: (target: PopupTarget, dataViewLogic: DataViewUILogicBase, onClose?: () => void) => import("@blocksuite/affine-components/context-menu").MenuHandler;
//# sourceMappingURL=view-options.d.ts.map