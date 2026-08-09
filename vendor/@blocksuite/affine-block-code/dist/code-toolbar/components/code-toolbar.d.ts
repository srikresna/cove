import type { MenuItemGroup } from '@blocksuite/affine-components/toolbar';
import { LitElement } from 'lit';
import type { CodeBlockToolbarContext } from '../context.js';
declare const AffineCodeToolbar_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineCodeToolbar extends AffineCodeToolbar_base {
    static styles: import("lit").CSSResult;
    private _currentOpenMenu;
    private _popMenuAbortController;
    closeCurrentMenu: () => void;
    private _toggleMoreMenu;
    disconnectedCallback(): void;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _moreButton;
    private accessor _moreMenuOpen;
    private accessor _collapsed;
    accessor context: CodeBlockToolbarContext;
    accessor moreGroups: MenuItemGroup<CodeBlockToolbarContext>[];
    accessor onActiveStatusChange: (active: boolean) => void;
    accessor primaryGroups: MenuItemGroup<CodeBlockToolbarContext>[];
}
export {};
//# sourceMappingURL=code-toolbar.d.ts.map