import { type NoteBlockModel } from '@blocksuite/affine-model';
import { ShadowlessElement } from '@blocksuite/std';
export declare const AFFINE_OUTLINE_NOTE_CARD = "affine-outline-note-card";
declare const OutlineNoteCard_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlineNoteCard extends OutlineNoteCard_base {
    private _displayModePopper;
    private readonly _showPopper$;
    private _dispatchClickBlockEvent;
    private _dispatchDisplayModeChangeEvent;
    private _dispatchFitViewEvent;
    private _dispatchSelectEvent;
    private _getCurrentModeLabel;
    private _watchDragEvents;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _displayModeButtonGroup;
    private accessor _displayModePanel;
    accessor activeHeadingId: string | null;
    accessor note: NoteBlockModel;
    accessor index: number;
    accessor status: 'selected' | 'dragging' | 'normal';
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_NOTE_CARD]: OutlineNoteCard;
    }
}
export {};
//# sourceMappingURL=outline-card.d.ts.map