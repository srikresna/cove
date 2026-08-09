import type { IVec } from '@blocksuite/global/gfx';
import type { PointerEventState } from '@blocksuite/std';
import { BaseTool } from '@blocksuite/std/gfx';
export declare enum DefaultModeDragType {
    /** Moving selected contents */
    ContentMoving = "content-moving",
    /** Native range dragging inside active note block */
    NativeEditing = "native-editing",
    /** Default void state */
    None = "none",
    /** Expanding the dragging area, select the content covered inside */
    Selecting = "selecting"
}
export declare class DefaultTool extends BaseTool {
    static toolName: string;
    private _edgeScrollingTimer;
    private readonly _clearDisposable;
    private readonly _clearSelectingState;
    private _disposables;
    private _scrollViewport;
    private _spaceTranslationRect;
    private readonly _enableEdgeScrolling;
    private readonly _stopEdgeScrolling;
    private _toBeMoved;
    private readonly _updateSelection;
    dragType: DefaultModeDragType;
    movementDragging: boolean;
    /**
     * Get the end position of the dragging area in the model coordinate
     */
    get dragLastPos(): IVec;
    /**
     * Get the start position of the dragging area in the model coordinate
     */
    get dragStartPos(): IVec;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get interactivity(): import("@blocksuite/std/gfx").InteractivityManager | null;
    private _cloneContent;
    private _determineDragType;
    private initializeDragState;
    click(e: PointerEventState): void;
    deactivate(): void;
    doubleClick(e: PointerEventState): void;
    dragEnd(e: PointerEventState): void;
    dragMove(e: PointerEventState): void;
    dragStart(e: PointerEventState): Promise<void>;
    mounted(): void;
    pointerDown(e: PointerEventState): void;
    pointerMove(e: PointerEventState): void;
    pointerUp(e: PointerEventState): void;
    unmounted(): void;
}
//# sourceMappingURL=default-tool.d.ts.map