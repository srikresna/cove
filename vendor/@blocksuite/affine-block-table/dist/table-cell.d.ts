import { type PopupTarget } from '@blocksuite/affine-components/context-menu';
import type { TableColumn, TableRow } from '@blocksuite/affine-model';
import { RichText } from '@blocksuite/affine-rich-text';
import { ShadowlessElement } from '@blocksuite/std';
import type { Text } from '@blocksuite/store';
import { nothing } from 'lit';
import type { SelectionController } from './selection-controller';
import type { TableDataManager } from './table-data-manager';
export declare const TableCellComponentName = "affine-table-cell";
declare const TableCell_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableCell extends TableCell_base {
    accessor text: Text | undefined;
    get readonly(): boolean;
    accessor dataManager: TableDataManager;
    accessor richText: RichText | null;
    accessor rowIndex: number;
    accessor columnIndex: number;
    accessor row: TableRow | undefined;
    accessor column: TableColumn | undefined;
    accessor selectionController: SelectionController;
    accessor height: number | undefined;
    get hoverColumnIndex$(): import("@preact/signals-core").Signal<number | undefined>;
    get hoverRowIndex$(): import("@preact/signals-core").Signal<number | undefined>;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes> | undefined;
    get topContenteditableElement(): import("@blocksuite/std").BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null | undefined;
    openColumnOptions(target: PopupTarget, column: TableColumn, columnIndex: number): void;
    openRowOptions(target: PopupTarget, row: TableRow, rowIndex: number): void;
    createColorPickerMenu(currentColor: string | undefined, select: (color?: string) => void): (menu: import("@blocksuite/affine-components/context-menu").Menu) => import("lit-html").TemplateResult<1> | undefined;
    onContextMenu(e: Event): void;
    renderColumnOptions(column: TableColumn, columnIndex: number): import("lit-html").TemplateResult<1>;
    renderRowOptions(row: TableRow, rowIndex: number): import("lit-html").TemplateResult<1>;
    renderOptionsButton(): import("lit-html").TemplateResult<1> | typeof nothing;
    tdMouseEnter(rowIndex: number, columnIndex: number): void;
    tdMouseLeave(): void;
    virtualWidth$: import("@preact/signals-core").ReadonlySignal<number | undefined>;
    tdStyle(): import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/style-map.js").StyleMapDirective>;
    showColumnIndicator$: import("@preact/signals-core").ReadonlySignal<"left" | "right" | undefined>;
    showRowIndicator$: import("@preact/signals-core").ReadonlySignal<"top" | "bottom" | undefined>;
    renderRowIndicator(): import("lit-html").TemplateResult<1> | typeof nothing;
    renderColumnIndicator(): import("lit-html").TemplateResult<1> | typeof nothing;
    richText$: import("@preact/signals-core").Signal<RichText | undefined>;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null | undefined;
    private readonly _handleKeyDown;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const createColumnDragPreview: (cells: TableCell[]) => HTMLDivElement;
export declare const createRowDragPreview: (cells: TableCell[]) => HTMLDivElement;
declare global {
    interface HTMLElementTagNameMap {
        [TableCellComponentName]: TableCell;
    }
}
export {};
//# sourceMappingURL=table-cell.d.ts.map