import { ShadowlessElement } from '@blocksuite/std';
export declare const AFFINE_OUTLINE_PANEL_BODY = "affine-outline-panel-body";
declare const OutlinePanelBody_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlinePanelBody extends OutlinePanelBody_base {
    private readonly _activeHeadingId$;
    private readonly _dragging$;
    private readonly _indicatorTranslateY$;
    private readonly _pageVisibleNotes$;
    private readonly _edgelessOnlyNotes$;
    private readonly _selectedNotes$;
    private readonly _allSelectedNotes$;
    private _clearHighlightMask;
    private _lockActiveHeadingId;
    private get _shouldRenderEmptyPanel();
    private get editor();
    private get store();
    get viewportPadding(): [number, number, number, number];
    private _deSelectNoteInEdgelessMode;
    private _renderEmptyPanel;
    private _fitToElement;
    private _handleDisplayModeChange;
    private _moveSelectedNotes;
    private _scrollToBlock;
    private _selectNote;
    private _watchSelectedNotes;
    private _watchNotes;
    private _watchDragAndDrop;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _renderDocTitle;
    private _renderNoteCards;
    private _renderPageVisibleCardList;
    private _renderEdgelessOnlyCardList;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _pageVisibleList;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_PANEL_BODY]: OutlinePanelBody;
    }
}
export {};
//# sourceMappingURL=outline-panel-body.d.ts.map