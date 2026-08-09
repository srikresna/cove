import type { Disposable } from '@blocksuite/global/disposable';
import { type Placement, type Rect } from '@floating-ui/dom';
export declare function listenClickAway(element: HTMLElement, onClickAway: () => void): Disposable;
type Display = 'show' | 'hidden';
export type ButtonPopperOptions = {
    reference: HTMLElement;
    popperElement: HTMLElement;
    topLayer?: boolean;
    stateUpdated?: (state: {
        display: Display;
    }) => void;
    mainAxis?: number;
    crossAxis?: number;
    allowedPlacements?: Placement[];
    rootBoundary?: Rect | (() => Rect | undefined);
    offsetHeight?: number;
};
/**
 * Using attribute 'data-show' to control popper visibility.
 *
 * ```css
 * selector {
 *   display: none;
 * }
 * selector[data-show] {
 *   display: block;
 * }
 * ```
 */
export declare function createButtonPopper(options: ButtonPopperOptions): {
    readonly state: Display;
    show: (force?: boolean) => void;
    hide: () => void;
    toggle: () => void;
    dispose: () => void;
};
export {};
//# sourceMappingURL=button-popper.d.ts.map