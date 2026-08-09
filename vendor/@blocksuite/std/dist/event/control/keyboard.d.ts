import { type UIEventHandler } from '../base.js';
import type { EventOptions, UIEventDispatcher } from '../dispatcher.js';
export declare class KeyboardControl {
    private readonly _dispatcher;
    private readonly _down;
    private readonly _shouldTrigger;
    private readonly _up;
    private composition;
    private readonly _press;
    constructor(_dispatcher: UIEventDispatcher);
    private _createContext;
    bindHotkey(keymap: Record<string, UIEventHandler>, options?: EventOptions): () => void;
    listen(): void;
}
//# sourceMappingURL=keyboard.d.ts.map