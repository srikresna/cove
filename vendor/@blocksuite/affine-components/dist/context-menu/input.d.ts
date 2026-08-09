import { type TemplateResult } from 'lit';
import type { StyleInfo } from 'lit-html/directives/style-map.js';
import { MenuFocusable } from './focusable.js';
import type { Menu } from './menu.js';
export type MenuInputData = {
    placeholder?: string;
    initialValue?: string;
    class?: string;
    onComplete?: (value: string) => void;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    disableAutoFocus?: boolean;
};
export declare class MenuInput extends MenuFocusable {
    static styles: import("lit").CSSResult;
    private readonly onCompositionEnd;
    private readonly onBlur;
    private readonly onInput;
    private readonly onKeydown;
    private readonly stopPropagation;
    complete(): void;
    connectedCallback(): void;
    onPressEnter(): void;
    protected render(): unknown;
    accessor data: MenuInputData;
    accessor inputRef: HTMLInputElement;
}
export declare class MobileMenuInput extends MenuFocusable {
    static styles: import("lit").CSSResult;
    private readonly onCompositionEnd;
    private readonly onInput;
    private readonly stopPropagation;
    complete(): void;
    onPressEnter(): void;
    protected render(): unknown;
    accessor data: MenuInputData;
    accessor inputRef: HTMLInputElement;
}
export declare const menuInputItems: {
    input: (config: {
        placeholder?: string;
        initialValue?: string;
        postfix?: TemplateResult;
        prefix?: TemplateResult;
        onComplete?: (value: string) => void;
        onChange?: (value: string) => void;
        onBlur?: (value: string) => void;
        disableAutoFocus?: boolean;
        class?: string;
        style?: Readonly<StyleInfo>;
    }) => (menu: Menu) => TemplateResult<1> | undefined;
};
//# sourceMappingURL=input.d.ts.map