import { Signal } from '@preact/signals-core';
import type { BlockStdScope } from '../scope/std-scope.js';
export declare class KeyboardController {
    readonly std: BlockStdScope;
    private readonly _disposable;
    shiftKey$: Signal<boolean>;
    spaceKey$: Signal<boolean>;
    constructor(std: BlockStdScope);
    private _init;
    private _listenKeyboard;
    dispose(): void;
}
//# sourceMappingURL=keyboard.d.ts.map