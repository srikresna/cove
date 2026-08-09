import type { UIEventDispatcher } from '../dispatcher.js';
export declare class RangeControl {
    private readonly _dispatcher;
    private readonly _buildScope;
    private readonly _compositionEnd;
    private readonly _compositionStart;
    private readonly _compositionUpdate;
    private _prev;
    private readonly _selectionChange;
    constructor(_dispatcher: UIEventDispatcher);
    private _buildEventScopeByNativeRange;
    private _createContext;
    private _findBlockComponentPath;
    listen(): void;
}
//# sourceMappingURL=range.d.ts.map