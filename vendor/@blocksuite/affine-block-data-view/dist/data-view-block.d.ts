import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { type DataSource, type DataViewProps, type DataViewSelection, type DataViewWidget } from '@blocksuite/data-view';
import { type BlockComponent } from '@blocksuite/std';
import type { DataViewBlockModel } from './data-view-model.js';
export declare class DataViewBlockComponent extends CaptionedBlockComponent<DataViewBlockModel> {
    static styles: import("lit").CSSResult;
    private readonly _clickDatabaseOps;
    private _dataSource?;
    _bindHotkey: DataViewProps['bindHotkey'];
    _handleEvent: DataViewProps['handleEvent'];
    headerWidget: DataViewWidget;
    selection$: import("@preact/signals-core").ReadonlySignal<DataViewSelection | undefined>;
    setSelection: (selection: DataViewSelection | undefined) => void;
    toolsWidget: DataViewWidget;
    get dataSource(): DataSource;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    private renderDatabaseOps;
    connectedCallback(): void;
    private readonly dataViewRootLogic;
    renderBlock(): import("lit-html").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view': DataViewBlockComponent;
    }
}
//# sourceMappingURL=data-view-block.d.ts.map