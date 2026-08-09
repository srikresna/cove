import type { Palette } from '@blocksuite/affine-model';
export declare function isTouchPadPinchEvent(e: WheelEvent): boolean;
export declare enum MOUSE_BUTTONS {
    AUXILIARY = 4,
    FIFTH = 16,
    FORTH = 8,
    NO_BUTTON = 0,
    PRIMARY = 1,
    SECONDARY = 2
}
export declare enum MOUSE_BUTTON {
    AUXILIARY = 1,
    FIFTH = 4,
    FORTH = 3,
    MAIN = 0,
    SECONDARY = 2
}
export declare function isMiddleButtonPressed(e: MouseEvent): boolean;
export declare function isRightButtonPressed(e: MouseEvent): boolean;
export declare function stopPropagation(event: Event): void;
export declare function isControlledKeyboardEvent(e: KeyboardEvent): boolean;
export declare function isNewTabTrigger(event?: MouseEvent): boolean;
export declare function isNewViewTrigger(event?: MouseEvent): boolean;
export declare function on<T extends HTMLElement, K extends keyof M, M = HTMLElementEventMap>(element: T, event: K, handler: (ev: M[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export declare function on<T extends HTMLElement>(element: T, event: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void;
export declare function on<T extends Document, K extends keyof M, M = DocumentEventMap>(element: T, event: K, handler: (ev: M[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export declare function once<T extends HTMLElement, K extends keyof M, M = HTMLElementEventMap>(element: T, event: K, handler: (ev: M[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export declare function once<T extends HTMLElement>(element: T, event: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): () => void;
export declare function once<T extends Document, K extends keyof M, M = DocumentEventMap>(element: T, event: K, handler: (ev: M[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
export declare function delayCallback(callback: () => void, delay?: number): () => void;
/**
 * A wrapper around `requestAnimationFrame` that only calls the callback if the
 * element is still connected to the DOM.
 */
export declare function requestConnectedFrame(callback: () => void, element?: HTMLElement): number;
/**
 * A wrapper around `requestConnectedFrame` that only calls at most once in one frame
 */
export declare function requestThrottledConnectedFrame<T extends (...args: any[]) => void>(func: T, element?: HTMLElement): T;
export declare const captureEventTarget: (target: EventTarget | null) => Element | null;
interface ObserverParams {
    target: HTMLElement;
    signal: AbortSignal;
    onInput?: (isComposition: boolean) => void;
    onDelete?: () => void;
    onMove?: (step: 1 | -1) => void;
    onConfirm?: () => void;
    onAbort?: () => void;
    onPaste?: () => void;
    interceptor?: (e: KeyboardEvent, next: () => void) => void;
}
/**
 * @deprecated don't use this, use event dispatch instead
 */
export declare const createKeydownObserver: ({ target, signal, onInput, onDelete, onMove, onConfirm, onAbort, onPaste, interceptor, }: ObserverParams) => void;
export declare class ColorEvent extends CustomEvent<Palette> {
}
export {};
//# sourceMappingURL=event.d.ts.map