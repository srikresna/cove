import { type Middleware } from '@floating-ui/dom';
import { type TemplateResult } from 'lit';
import { MenuFocusable } from './focusable.js';
import { Menu, type MenuOptions } from './menu.js';
export type MenuSubMenuData = {
    content: () => TemplateResult;
    options: MenuOptions;
    select?: () => void;
    class?: string;
    openOnHover?: boolean;
    middleware?: Middleware[];
    autoHeight?: boolean;
    closeOnSelect?: boolean;
};
export declare const subMenuOffset: {
    name: string;
    options?: any;
    fn: (state: import("@floating-ui/dom").MiddlewareState) => import("@floating-ui/core").MiddlewareReturn | Promise<import("@floating-ui/core").MiddlewareReturn>;
};
export declare const subMenuPlacements: {
    name: string;
    options?: any;
    fn: (state: import("@floating-ui/dom").MiddlewareState) => import("@floating-ui/core").MiddlewareReturn | Promise<import("@floating-ui/core").MiddlewareReturn>;
};
export declare const subMenuMiddleware: {
    name: string;
    options?: any;
    fn: (state: import("@floating-ui/dom").MiddlewareState) => import("@floating-ui/core").MiddlewareReturn | Promise<import("@floating-ui/core").MiddlewareReturn>;
}[];
export declare const dropdownSubMenuMiddleware: {
    name: string;
    options?: any;
    fn: (state: import("@floating-ui/dom").MiddlewareState) => import("@floating-ui/core").MiddlewareReturn | Promise<import("@floating-ui/core").MiddlewareReturn>;
}[];
export declare class MenuSubMenu extends MenuFocusable {
    static styles: import("lit").CSSResult[];
    createTime: number;
    connectedCallback(): void;
    onMouseEnter(): void;
    onPressEnter(): void;
    openSubMenu(): void;
    protected render(): unknown;
    accessor data: MenuSubMenuData;
}
export declare class MobileSubMenu extends MenuFocusable {
    connectedCallback(): void;
    onMouseEnter(): void;
    onPressEnter(): void;
    openSubMenu(): void;
    protected render(): unknown;
    accessor data: MenuSubMenuData;
}
export declare const renderSubMenu: (data: MenuSubMenuData, menu: Menu) => TemplateResult<1>;
export declare const subMenuItems: {
    subMenu: (config: {
        name: string;
        label?: () => TemplateResult;
        select?: () => void;
        isSelected?: boolean;
        postfix?: TemplateResult;
        prefix?: TemplateResult;
        class?: string;
        options: MenuOptions;
        disableArrow?: boolean;
        hide?: () => boolean;
        openOnHover?: boolean;
        middleware?: Middleware[];
        autoHeight?: boolean;
        closeOnSelect?: boolean;
    }) => (menu: Menu) => TemplateResult<1> | undefined;
};
//# sourceMappingURL=sub-menu.d.ts.map