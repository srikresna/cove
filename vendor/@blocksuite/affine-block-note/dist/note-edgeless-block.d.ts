import { type BoxSelectionContext } from '@blocksuite/std/gfx';
import { nothing, type PropertyValues } from 'lit';
import { NoteBlockComponent } from './note-block';
export declare const AFFINE_EDGELESS_NOTE = "affine-edgeless-note";
declare const EdgelessNoteBlockComponent_base: typeof NoteBlockComponent & (new (...args: any[]) => import("@blocksuite/std").GfxBlockComponent);
export declare class EdgelessNoteBlockComponent extends EdgelessNoteBlockComponent_base {
    private get _isShowCollapsedContent();
    private get _dragging();
    private _collapsedContent;
    private _handleKeyDown;
    private _hovered;
    private _hoverTimeout;
    private _leaved;
    private _setCollapse;
    connectedCallback(): void;
    disconnectedCallback(): void;
    get edgelessSlots(): {
        readonlyUpdated: import("rxjs").Subject<boolean>;
        navigatorSettingUpdated: import("rxjs").Subject<{
            hideToolbar?: boolean;
            blackBackground?: boolean;
            fillScreen?: boolean;
        }>;
        navigatorFrameChanged: import("rxjs").Subject<import("@blocksuite/affine-model").FrameBlockModel>;
        fullScreenToggled: import("rxjs").Subject<void>;
        elementResizeStart: import("rxjs").Subject<void>;
        elementResizeEnd: import("rxjs").Subject<void>;
        toggleNoteSlicer: import("rxjs").Subject<void>;
        toolbarLocked: import("rxjs").Subject<boolean>;
    };
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    getCSSScaleVal(): number;
    getRenderingRect(): {
        x: number;
        y: number;
        w: number;
        h: string | number;
        zIndex: string;
    };
    renderGfxBlock(): typeof nothing | import("lit-html").TemplateResult<1>;
    onBoxSelected(_: BoxSelectionContext): boolean;
    private accessor _editing;
    private accessor _isHover;
    private accessor _isResizing;
    private accessor _noteFullHeight;
    accessor hideMask: boolean;
    private accessor _noteContent;
    private accessor _docTitle;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_EDGELESS_NOTE]: EdgelessNoteBlockComponent;
    }
}
export declare const EdgelessNoteInteraction: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=note-edgeless-block.d.ts.map