import { IS_IOS, IS_MAC } from '@blocksuite/global/env';
export function isTouchPadPinchEvent(e) {
    // two finger pinches on touch pad, ctrlKey is always true.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=397027
    if (IS_IOS || IS_MAC) {
        return e.ctrlKey || e.metaKey;
    }
    return e.ctrlKey;
}
// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
export var MOUSE_BUTTONS;
(function (MOUSE_BUTTONS) {
    MOUSE_BUTTONS[MOUSE_BUTTONS["AUXILIARY"] = 4] = "AUXILIARY";
    MOUSE_BUTTONS[MOUSE_BUTTONS["FIFTH"] = 16] = "FIFTH";
    MOUSE_BUTTONS[MOUSE_BUTTONS["FORTH"] = 8] = "FORTH";
    MOUSE_BUTTONS[MOUSE_BUTTONS["NO_BUTTON"] = 0] = "NO_BUTTON";
    MOUSE_BUTTONS[MOUSE_BUTTONS["PRIMARY"] = 1] = "PRIMARY";
    MOUSE_BUTTONS[MOUSE_BUTTONS["SECONDARY"] = 2] = "SECONDARY";
})(MOUSE_BUTTONS || (MOUSE_BUTTONS = {}));
export var MOUSE_BUTTON;
(function (MOUSE_BUTTON) {
    MOUSE_BUTTON[MOUSE_BUTTON["AUXILIARY"] = 1] = "AUXILIARY";
    MOUSE_BUTTON[MOUSE_BUTTON["FIFTH"] = 4] = "FIFTH";
    MOUSE_BUTTON[MOUSE_BUTTON["FORTH"] = 3] = "FORTH";
    MOUSE_BUTTON[MOUSE_BUTTON["MAIN"] = 0] = "MAIN";
    MOUSE_BUTTON[MOUSE_BUTTON["SECONDARY"] = 2] = "SECONDARY";
})(MOUSE_BUTTON || (MOUSE_BUTTON = {}));
export function isMiddleButtonPressed(e) {
    return (MOUSE_BUTTONS.AUXILIARY & e.buttons) === MOUSE_BUTTONS.AUXILIARY;
}
export function isRightButtonPressed(e) {
    return (MOUSE_BUTTONS.SECONDARY & e.buttons) === MOUSE_BUTTONS.SECONDARY;
}
export function stopPropagation(event) {
    event.stopPropagation();
}
export function isControlledKeyboardEvent(e) {
    return e.ctrlKey || e.metaKey || e.altKey;
}
export function isNewTabTrigger(event) {
    return event
        ? (event.ctrlKey || event.metaKey || event.button === 1) && !event.altKey
        : false;
}
export function isNewViewTrigger(event) {
    return event ? (event.ctrlKey || event.metaKey) && event.altKey : false;
}
export function on(element, event, handler, options) {
    const dispose = () => {
        element.removeEventListener(event, handler, options);
    };
    element.addEventListener(event, handler, options);
    return dispose;
}
export function once(element, event, handler, options) {
    const onceHandler = (e) => {
        dispose();
        handler(e);
    };
    const dispose = () => {
        element.removeEventListener(event, onceHandler, options);
    };
    element.addEventListener(event, onceHandler, options);
    return dispose;
}
export function delayCallback(callback, delay = 0) {
    const timeoutId = setTimeout(callback, delay);
    return () => clearTimeout(timeoutId);
}
/**
 * A wrapper around `requestAnimationFrame` that only calls the callback if the
 * element is still connected to the DOM.
 */
export function requestConnectedFrame(callback, element) {
    return requestAnimationFrame(() => {
        // If element is not provided, fallback to `requestAnimationFrame`
        if (element === undefined) {
            callback();
            return;
        }
        // Only calls callback if element is still connected to the DOM
        if (element.isConnected)
            callback();
    });
}
/**
 * A wrapper around `requestConnectedFrame` that only calls at most once in one frame
 */
export function requestThrottledConnectedFrame(func, element) {
    let raqId = undefined;
    let latestArgs = [];
    return ((...args) => {
        latestArgs = args;
        if (raqId)
            return;
        raqId = requestConnectedFrame(() => {
            raqId = undefined;
            func(...latestArgs);
        }, element);
    });
}
export const captureEventTarget = (target) => {
    const isElementOrNode = target instanceof Element || target instanceof Node;
    return isElementOrNode
        ? target instanceof Element
            ? target
            : target.parentElement
        : null;
};
/**
 * @deprecated don't use this, use event dispatch instead
 */
export const createKeydownObserver = ({ target, signal, onInput, onDelete, onMove, onConfirm, onAbort, onPaste, interceptor = (_, next) => next(), }) => {
    const keyDownListener = (e) => {
        if (e.key === 'Process' || e.isComposing)
            return;
        if (e.defaultPrevented)
            return;
        if (isControlledKeyboardEvent(e)) {
            const isOnlyCmd = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
            // Ctrl/Cmd + alphabet key
            if (isOnlyCmd && e.key.length === 1) {
                switch (e.key) {
                    // Previous command
                    case 'p': {
                        onMove?.(-1);
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    // Next command
                    case 'n': {
                        onMove?.(1);
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    // Paste command
                    case 'v': {
                        onPaste?.();
                        return;
                    }
                }
            }
            // Pressing **only** modifier key is allowed and will be ignored
            // Because we don't know the user's intention
            // Aborting here will cause the above hotkeys to not work
            if (e.key === 'Control' || e.key === 'Meta' || e.key === 'Alt') {
                e.stopPropagation();
                return;
            }
            // Abort when press modifier key + any other key to avoid weird behavior
            // e.g. press ctrl + a to select all
            onAbort?.();
            return;
        }
        e.stopPropagation();
        if (
        // input abc, 123, etc.
        !isControlledKeyboardEvent(e) &&
            e.key.length === 1) {
            onInput?.(false);
            return;
        }
        switch (e.key) {
            case 'Backspace': {
                onDelete?.();
                return;
            }
            case 'Enter': {
                if (e.shiftKey) {
                    onAbort?.();
                    return;
                }
                onConfirm?.();
                e.preventDefault();
                return;
            }
            case 'Tab': {
                if (e.shiftKey) {
                    onMove?.(-1);
                }
                else {
                    onMove?.(1);
                }
                e.preventDefault();
                return;
            }
            case 'ArrowUp': {
                if (e.shiftKey) {
                    onAbort?.();
                    return;
                }
                onMove?.(-1);
                e.preventDefault();
                return;
            }
            case 'ArrowDown': {
                if (e.shiftKey) {
                    onAbort?.();
                    return;
                }
                onMove?.(1);
                e.preventDefault();
                return;
            }
            case 'Escape':
            case 'ArrowLeft':
            case 'ArrowRight': {
                onAbort?.();
                return;
            }
            default:
                // Other control keys
                return;
        }
    };
    target.addEventListener('keydown', (e) => interceptor(e, () => keyDownListener(e)), {
        // Workaround: Use capture to prevent the event from triggering the keyboard bindings action
        capture: true,
        signal,
    });
    // Fix paste input
    target.addEventListener('paste', () => onDelete?.(), { signal });
    // Fix composition input
    target.addEventListener('compositionend', () => onInput?.(true), { signal });
};
export class ColorEvent extends CustomEvent {
}
