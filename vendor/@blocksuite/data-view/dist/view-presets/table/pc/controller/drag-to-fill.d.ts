import { ShadowlessElement } from '@blocksuite/std';
import type { TableViewAreaSelection } from '../../selection';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
export declare class DragToFillElement extends ShadowlessElement {
    static styles: import("lit").CSSResult;
    dragToFillRef: import("lit-html/directives/ref.js").Ref<HTMLDivElement>;
    render(): import("lit-html").TemplateResult<1>;
    accessor dragging: boolean;
}
export declare function fillSelectionWithFocusCellData(logic: TableViewUILogic, selection: TableViewAreaSelection): void;
//# sourceMappingURL=drag-to-fill.d.ts.map