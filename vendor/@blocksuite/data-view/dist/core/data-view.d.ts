import type { DatabaseAllEvents, EventTraceFn } from '@blocksuite/affine-shared/services';
import type { DisposableMember } from '@blocksuite/global/disposable';
import { type Clipboard, type DndController, type EventName, ShadowlessElement, type UIEventHandler } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
import type { DataSource } from './data-source/index.js';
import type { DataViewSelection } from './types.js';
import type { DataViewUILogicBase } from './view/data-view-base.js';
import type { SingleView } from './view-manager/single-view.js';
import type { DataViewWidget } from './widget/index.js';
export type DataViewRendererConfig = {
    clipboard: Clipboard;
    dnd?: DndController;
    onDrag?: (evt: MouseEvent, id: string) => () => void;
    notification: {
        toast: (message: string) => void;
    };
    virtualPadding$: ReadonlySignal<number>;
    headerWidget: DataViewWidget | undefined;
    handleEvent: (name: EventName, handler: UIEventHandler) => DisposableMember;
    bindHotkey: (hotkeys: Record<string, UIEventHandler>) => DisposableMember;
    dataSource: DataSource;
    selection$: ReadonlySignal<DataViewSelection | undefined>;
    setSelection: (selection: DataViewSelection | undefined) => void;
    eventTrace: EventTraceFn<DatabaseAllEvents>;
    detailPanelConfig: {
        openDetailPanel: (target: HTMLElement, data: {
            view: SingleView;
            rowId: string;
        }) => Promise<void>;
    };
};
export declare class DataViewRootUILogic {
    readonly config: DataViewRendererConfig;
    private get dataSource();
    private get viewManager();
    private createDataViewUILogic;
    private readonly _viewsCache;
    private readonly views$;
    private readonly viewsMap$;
    private readonly _uiRef;
    get selection$(): ReadonlySignal<DataViewSelection | undefined>;
    setSelection(selection?: DataViewSelection): void;
    constructor(config: DataViewRendererConfig);
    get dataViewRenderer(): DataViewRootUI | undefined;
    readonly currentViewId$: ReadonlySignal<string | undefined>;
    readonly currentView$: ReadonlySignal<DataViewUILogicBase<SingleView, DataViewSelection> | undefined>;
    focusFirstCell: () => void;
    openDetailPanel: (ops: {
        view: SingleView;
        rowId: string;
        onClose?: () => void;
    }) => void;
    setupViewChangeListener(): () => void;
    render(): import("lit-html").TemplateResult;
}
declare const DataViewRootUI_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DataViewRootUI extends DataViewRootUI_base {
    static styles: import("lit").CSSResult;
    accessor logic: DataViewRootUILogic;
    accessor currentView: string | undefined;
    focusFirstCell: () => void;
    openDetailPanel: (ops: {
        view: SingleView;
        rowId: string;
        onClose?: () => void;
    }) => void;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult | undefined;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-renderer': DataViewRootUI;
    }
}
export {};
//# sourceMappingURL=data-view.d.ts.map