import type { ReadonlySignal } from '@preact/signals-core';
import { type TemplateResult } from 'lit';
import type { ClassInfo } from 'lit-html/directives/class-map.js';
import { MenuFocusable } from './focusable.js';
import type { Menu } from './menu.js';
import type { MenuClass } from './types.js';
export type MenuButtonData = {
    content: () => TemplateResult;
    class: ClassInfo;
    select: (ele: HTMLElement) => void | false;
    onHover?: (hover: boolean) => void;
    testId?: string;
    closeOnSelect?: boolean;
};
export declare class MenuButton extends MenuFocusable {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    disconnectedCallback(): void;
    onClick(): void;
    onPressEnter(): void;
    protected render(): unknown;
    accessor data: MenuButtonData;
}
export declare class MobileMenuButton extends MenuFocusable {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    onClick(): void;
    onPressEnter(): void;
    protected render(): unknown;
    accessor data: MenuButtonData;
}
export declare const menuButtonItems: {
    action: (config: {
        name: string;
        label?: () => TemplateResult;
        info?: TemplateResult;
        prefix?: TemplateResult;
        postfix?: TemplateResult;
        isSelected?: boolean;
        select: (ele: HTMLElement) => void | false;
        onHover?: (hover: boolean) => void;
        class?: MenuClass;
        closeOnSelect?: boolean;
        hide?: () => boolean;
        testId?: string;
    }) => (menu: Menu) => TemplateResult<1> | undefined;
    checkbox: (config: {
        name: string;
        checked: ReadonlySignal<boolean>;
        postfix?: TemplateResult;
        label?: () => TemplateResult;
        select: (checked: boolean) => boolean;
        class?: ClassInfo;
        testId?: string;
    }) => (menu: Menu) => TemplateResult<1> | undefined;
    toggleSwitch: (config: {
        name: string;
        on: boolean;
        prefix?: TemplateResult;
        postfix?: TemplateResult;
        label?: () => TemplateResult;
        onChange: (on: boolean) => void;
        class?: ClassInfo;
        testId?: string;
    }) => (menu: Menu) => TemplateResult<1> | undefined;
};
//# sourceMappingURL=button.d.ts.map