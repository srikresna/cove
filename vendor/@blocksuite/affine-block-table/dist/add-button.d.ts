import { ShadowlessElement } from '@blocksuite/std';
import type { TableDataManager } from './table-data-manager';
export declare const AddButtonComponentName = "affine-table-add-button";
declare const AddButton_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AddButton extends AddButton_base {
    accessor vertical: boolean;
    accessor dataManager: TableDataManager;
    get hoverColumnIndex$(): import("@preact/signals-core").Signal<number | undefined>;
    get hoverRowIndex$(): import("@preact/signals-core").Signal<number | undefined>;
    get columns$(): import("@preact/signals-core").ReadonlySignal<import("@blocksuite/affine-model").TableColumn[]>;
    get rows$(): import("@preact/signals-core").ReadonlySignal<import("@blocksuite/affine-model").TableRow[]>;
    addColumnButtonRef$: import("@preact/signals-core").Signal<HTMLDivElement | undefined>;
    addRowButtonRef$: import("@preact/signals-core").Signal<HTMLDivElement | undefined>;
    addRowColumnButtonRef$: import("@preact/signals-core").Signal<HTMLDivElement | undefined>;
    columnDragging$: import("@preact/signals-core").Signal<boolean>;
    rowDragging$: import("@preact/signals-core").Signal<boolean>;
    rowColumnDragging$: import("@preact/signals-core").Signal<boolean>;
    popCellCountTips: (ele: Element) => {
        tip: HTMLDivElement;
        dispose: () => void;
    };
    getEmptyRows(): number[];
    getEmptyColumns(): number[];
    onDragStart(e: MouseEvent): void;
    connectedCallback(): void;
    renderAddColumnButton(): import("lit-html").TemplateResult<1>;
    renderAddRowButton(): import("lit-html").TemplateResult<1>;
    renderAddRowColumnButton(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        [AddButtonComponentName]: AddButton;
    }
}
export {};
//# sourceMappingURL=add-button.d.ts.map