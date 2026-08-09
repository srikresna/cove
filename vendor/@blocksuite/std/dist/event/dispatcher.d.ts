import { DisposableGroup } from '@blocksuite/global/disposable';
import { LifeCycleWatcher } from '../extension/index.js';
import type { BlockStdScope } from '../scope/index.js';
import { EditorHost } from '../view/index.js';
import { type UIEventHandler, UIEventStateContext } from './base.js';
import { KeyboardControl } from './control/keyboard.js';
declare const eventNames: readonly ["click", "doubleClick", "tripleClick", "pointerDown", "pointerMove", "pointerUp", "pointerOut", "dragStart", "dragMove", "dragEnd", "pinch", "pan", "keyDown", "keyUp", "keyPress", "selectionChange", "compositionStart", "compositionUpdate", "compositionEnd", "cut", "copy", "paste", "nativeDragStart", "nativeDragMove", "nativeDragEnd", "nativeDrop", "nativeDragOver", "nativeDragLeave", "beforeInput", "blur", "focus", "contextMenu", "wheel"];
export type EventName = (typeof eventNames)[number];
export type EventOptions = {
    flavour?: string;
    blockId?: string;
};
export type EventHandlerRunner = {
    fn: UIEventHandler;
    flavour?: string;
    blockId?: string;
};
export declare class UIEventDispatcher extends LifeCycleWatcher {
    private static _activeDispatcher;
    static readonly key = "UIEventDispatcher";
    private readonly _active;
    private readonly _clipboardControl;
    private _handlersMap;
    private readonly _keyboardControl;
    private readonly _pointerControl;
    private readonly _rangeControl;
    bindHotkey: (...args: Parameters<KeyboardControl["bindHotkey"]>) => () => void;
    disposables: DisposableGroup;
    private get _currentSelections();
    get active(): boolean;
    get active$(): import("@preact/signals-core").Signal<boolean>;
    get host(): EditorHost;
    constructor(std: BlockStdScope);
    private _bindEvents;
    private _buildEventScopeBySelection;
    private _buildEventScopeByTarget;
    private _getDeepActiveElement;
    private _getEventScope;
    private _isActiveElementOutsideHost;
    private _isEditableElementActive;
    private _setActive;
    set active(active: boolean);
    add(name: EventName, handler: UIEventHandler, options?: EventOptions): () => void;
    buildEventScope(name: EventName, blocks: string[]): EventHandlerRunner[] | undefined;
    mounted(): void;
    run(name: EventName, context: UIEventStateContext, runners?: EventHandlerRunner[]): void;
    unmounted(): void;
}
export {};
//# sourceMappingURL=dispatcher.d.ts.map