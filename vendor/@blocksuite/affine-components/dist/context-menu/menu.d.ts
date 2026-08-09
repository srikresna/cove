import type { TemplateResult } from 'lit';
import { MenuFocusable } from './focusable.js';
import type { MenuComponentInterface } from './types.js';
export type MenuConfig = (menu: Menu, index: number) => TemplateResult | undefined;
export type MenuOptions = {
    onComplete?: () => void;
    onClose?: () => void;
    title?: {
        text: string;
        onBack?: (menu: Menu) => boolean | void;
        onClose?: () => void;
        postfix?: () => TemplateResult;
    };
    search?: {
        placeholder?: string;
    };
    items: MenuConfig[];
    testId?: string;
};
type MenuOpenListener = (menu: Menu) => (() => void) | void;
export declare function onMenuOpen(listener: MenuOpenListener): () => void;
export declare class Menu {
    options: MenuOptions;
    private _cleanupFns;
    private readonly _currentFocused$;
    private readonly _subMenu$;
    closed: boolean;
    readonly currentFocused$: import("@preact/signals-core").ReadonlySignal<MenuFocusable | undefined>;
    menuElement: MenuComponentInterface;
    searchName$: import("@preact/signals-core").Signal<string>;
    searchResult$: import("@preact/signals-core").ReadonlySignal<TemplateResult[]>;
    showSearch$: import("@preact/signals-core").ReadonlySignal<boolean>;
    get enableSearch(): boolean;
    constructor(options: MenuOptions);
    close(): void;
    closeSubMenu(): void;
    focusNext(): void;
    focusPrev(): void;
    focusTo(ele?: MenuFocusable): void;
    openSubMenu(menu: Menu): void;
    pressEnter(): void;
    renderItems(items: MenuConfig[]): TemplateResult[];
    search(name: string): boolean;
    setFocusOnly(ele?: MenuFocusable): void;
}
export {};
//# sourceMappingURL=menu.d.ts.map