import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import type { TableBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { SelectionController } from './selection-controller';
import { TableDataManager } from './table-data-manager';
export declare const TableBlockComponentName = "affine-table";
export declare class TableBlockComponent extends CaptionedBlockComponent<TableBlockModel> {
    private _dataManager;
    get dataManager(): TableDataManager;
    selectionController: SelectionController;
    connectedCallback(): void;
    private setInternalEditablesEnabled;
    private hasExternalNativeSelection;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    private readonly virtualPaddingController;
    table$: import("@preact/signals-core").Signal<HTMLTableElement | undefined>;
    getScale(): number;
    private readonly getRootRect;
    private readonly getRowRect;
    private readonly getColumnRect;
    private readonly getAreaRect;
    renderBlock(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        [TableBlockComponentName]: TableBlockComponent;
    }
}
//# sourceMappingURL=table-block.d.ts.map