import { EditorHost } from '../../view/index.js';
import type { RangeManager } from './range-manager.js';
/**
 * Two-way binding between native range and text selection
 */
export declare class RangeBinding {
    manager: RangeManager;
    private _compositionStartCallback;
    private readonly _computePath;
    private readonly _onBeforeInput;
    private readonly _onCompositionEnd;
    private readonly _onCompositionStart;
    private readonly _onNativeSelectionChanged;
    private readonly _onStdSelectionChanged;
    private _prevTextSelection;
    isComposing: boolean;
    get host(): EditorHost;
    get rangeManager(): RangeManager;
    get selectionManager(): import("@blocksuite/store").StoreSelectionExtension;
    constructor(manager: RangeManager);
}
//# sourceMappingURL=range-binding.d.ts.map