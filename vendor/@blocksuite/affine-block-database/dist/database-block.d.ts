import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { DropIndicator } from '@blocksuite/affine-components/drop-indicator';
import type { DatabaseBlockModel } from '@blocksuite/affine-model';
import { type DataViewWidget, type SingleView } from '@blocksuite/data-view';
import { type BlockComponent } from '@blocksuite/std';
import type { DatabaseViewExtensionOptions } from './view';
export declare class DatabaseBlockComponent extends CaptionedBlockComponent<DatabaseBlockModel> {
    private readonly clickDatabaseOps;
    private readonly dataSource;
    private readonly renderTitle;
    createTemplate: (data: {
        view: SingleView;
        rowId: string;
    }, openDoc: (docId: string) => void) => import("lit-html").TemplateResult<1 | 2 | 3>;
    headerWidget: DataViewWidget;
    indicator: DropIndicator;
    onDrag: (evt: MouseEvent, id: string) => (() => void);
    private readonly setSelection;
    private readonly toolsWidget;
    private readonly viewSelection$;
    private readonly virtualPadding$;
    get optionsConfig(): DatabaseViewExtensionOptions;
    get isCommentHighlighted(): boolean;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    private renderDatabaseOps;
    connectedCallback(): void;
    listenFullWidthChange(): void;
    handleMobileEditing(): void;
    private readonly dataViewRootLogic;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor useZeroWidth: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database': DatabaseBlockComponent;
    }
}
//# sourceMappingURL=database-block.d.ts.map