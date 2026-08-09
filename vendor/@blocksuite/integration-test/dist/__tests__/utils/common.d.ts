import type { Point } from '@blocksuite/global/gfx';
export declare function wait(time?: number): Promise<unknown>;
/**
 * simulate click event
 * @param target
 * @param position position relative to the target
 */
export declare function click(target: HTMLElement, position: {
    x: number;
    y: number;
}): void;
type PointerOptions = {
    isPrimary?: boolean;
    pointerId?: number;
    pointerType?: string;
};
/**
 * simulate pointerdown event
 * @param target
 * @param position position relative to the target
 */
export declare function pointerdown(target: HTMLElement, position: {
    x: number;
    y: number;
}, options?: PointerOptions): void;
/**
 * simulate pointerup event
 * @param target
 * @param position position relative to the target
 */
export declare function pointerup(target: HTMLElement, position: {
    x: number;
    y: number;
}, options?: PointerOptions): void;
/**
 * simulate pointermove event
 * @param target
 * @param position position relative to the target
 */
export declare function pointermove(target: HTMLElement, position: {
    x: number;
    y: number;
}, options?: PointerOptions): void;
export declare function drag(target: HTMLElement, start: {
    x: number;
    y: number;
}, end: {
    x: number;
    y: number;
}, step?: number): void;
export declare function multiTouchDown(target: Element, points: Point[]): void;
export declare function multiTouchMove(target: Element, from: Point[], to: Point[], step?: number): void;
export declare function multiTouchUp(target: Element, points: Point[]): void;
export {};
//# sourceMappingURL=common.d.ts.map