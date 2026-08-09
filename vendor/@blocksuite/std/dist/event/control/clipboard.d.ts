import type { UIEventDispatcher } from '../dispatcher.js';
export declare class ClipboardControl {
    private readonly _dispatcher;
    private readonly _copy;
    private readonly _cut;
    private readonly _paste;
    constructor(_dispatcher: UIEventDispatcher);
    private _createContext;
    listen(): void;
}
//# sourceMappingURL=clipboard.d.ts.map