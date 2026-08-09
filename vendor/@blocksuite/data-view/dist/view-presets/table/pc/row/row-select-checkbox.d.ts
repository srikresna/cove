import { ShadowlessElement } from '@blocksuite/std';
import type { TableViewUILogic } from '../table-view-ui-logic';
declare const RowSelectCheckbox_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class RowSelectCheckbox extends RowSelectCheckbox_base {
    static styles: import("lit").CSSResult;
    accessor groupKey: string | undefined;
    accessor rowId: string;
    accessor tableViewLogic: TableViewUILogic;
    isSelected$: import("@preact/signals-core").ReadonlySignal<boolean>;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=row-select-checkbox.d.ts.map