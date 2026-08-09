import type { ReadonlySignal, Signal } from '@preact/signals-core';
import { LitElement, type TemplateResult } from 'lit';
import { type EditorMenuButton } from '../toolbar';
type SizeItem = {
    key?: string | number;
    value: number;
};
declare const SizeDropdownMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class SizeDropdownMenu extends SizeDropdownMenu_base {
    static styles: import("lit").CSSResult;
    accessor sizes: readonly SizeItem[];
    accessor sizeSignal: Signal<number> | ReadonlySignal<number>;
    accessor maxSize: number;
    accessor minSize: number;
    accessor format: ((e: number) => string) | undefined;
    accessor label: string;
    accessor icon: TemplateResult | undefined;
    accessor type: 'normal' | 'check';
    clamp(value: number, min?: number, max?: number): number;
    select(value: number): void;
    private readonly _onKeydown;
    accessor input: HTMLInputElement;
    accessor menuButton: EditorMenuButton;
    firstUpdated(): void;
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-size-dropdown-menu': SizeDropdownMenu;
    }
}
export {};
//# sourceMappingURL=dropdown-menu.d.ts.map