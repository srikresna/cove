import { ShadowlessElement } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
declare const VirtualElementWrapper_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class VirtualElementWrapper extends VirtualElementWrapper_base {
    accessor rect: {
        left$: ReadonlySignal<number | undefined>;
        top$: ReadonlySignal<number | undefined>;
        width$: ReadonlySignal<number | undefined>;
        height$: ReadonlySignal<number | undefined>;
    };
    accessor updateHeight: (height: number) => void;
    accessor element: HTMLElement;
    connectedCallback(): void;
    render(): HTMLElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'virtual-element-wrapper': VirtualElementWrapper;
    }
}
export {};
//# sourceMappingURL=virtual-cell.d.ts.map