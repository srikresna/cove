import type { NoteBlockComponent } from '@blocksuite/affine-block-note';
import { type RootBlockModel } from '@blocksuite/affine-model';
import type { EdgelessSelectedRectWidget } from '@blocksuite/affine-widget-edgeless-selected-rect';
import { WidgetComponent } from '@blocksuite/std';
import { nothing, type PropertyValues } from 'lit';
export declare const NOTE_SLICER_WIDGET = "note-slicer";
export declare class NoteSlicer extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private _divingLinePositions;
    private _hidden;
    private _noteBlockIds;
    private _noteDisposables;
    get _editorHost(): import("@blocksuite/std").EditorHost;
    get _noteBlock(): NoteBlockComponent | null;
    get _selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get _viewportOffset(): {
        left: number;
        top: number;
    };
    get _zoom(): number;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get selectedRectEle(): EdgelessSelectedRectWidget | null;
    private _sliceNote;
    private _updateActiveSlicerIndex;
    private _updateDivingLineAndBlockIds;
    private _updateSlicedNote;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    protected updated(_changedProperties: PropertyValues): void;
    private accessor _activeSlicerIndex;
    private accessor _anchorNote;
    private accessor _enableNoteSlicer;
    private accessor _isResizing;
}
export declare const noteSlicerWidget: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=note-slicer.d.ts.map