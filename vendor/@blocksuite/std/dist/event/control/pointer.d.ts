import type { UIEventDispatcher } from '../dispatcher.js';
export declare class PointerControl {
    private readonly _dispatcher;
    private _cachedRect;
    private readonly _getRect;
    private _pollingInterval;
    private readonly controllers;
    constructor(_dispatcher: UIEventDispatcher);
    private _startPolling;
    protected _updateRect(): void;
    dispose(): void;
    listen(): void;
}
//# sourceMappingURL=pointer.d.ts.map