import type { MenuItemGroup } from '@blocksuite/affine-components/toolbar';
import { ShadowlessElement } from '@blocksuite/std';
import type { CodeBlockToolbarContext } from '../context.js';
declare const AffineCodeMoreMenu_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineCodeMoreMenu extends AffineCodeMoreMenu_base {
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor context: CodeBlockToolbarContext;
    accessor moreGroups: MenuItemGroup<CodeBlockToolbarContext>[];
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-code-more-menu': AffineCodeMoreMenu;
    }
}
export {};
//# sourceMappingURL=more-menu.d.ts.map