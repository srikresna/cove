import type { AffineInlineEditor } from '@blocksuite/affine-shared/types';
import { LitElement, nothing, type PropertyValues } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { SlashMenuActionItem, SlashMenuContext, SlashMenuItem } from './types.js';
type InnerSlashMenuContext = SlashMenuContext & {
    onClickItem: (item: SlashMenuActionItem) => void;
    searching: boolean;
};
declare const SlashMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class SlashMenu extends SlashMenu_base {
    private readonly inlineEditor;
    private readonly abortController;
    static styles: import("lit").CSSResult;
    private get _telemetry();
    private get _editorMode();
    private readonly _handleClickItem;
    private readonly _initItemPathMap;
    private _innerSlashMenuContext;
    private readonly _itemPathMap;
    private _queryState;
    private readonly _startRange;
    private readonly _updateFilteredItems;
    private get _query();
    get host(): import("@blocksuite/std").EditorHost;
    constructor(inlineEditor: AffineInlineEditor, abortController?: AbortController);
    connectedCallback(): void;
    protected willUpdate(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _filteredItems;
    private accessor _position;
    accessor items: SlashMenuItem[];
    accessor context: SlashMenuContext;
}
declare const InnerSlashMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class InnerSlashMenu extends InnerSlashMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _closeSubMenu;
    private _currentSubMenu;
    private readonly _openSubMenu;
    private readonly _renderActionItem;
    private readonly _renderGroup;
    private readonly _renderItem;
    private readonly _renderSubMenuItem;
    private _subMenuAbortController;
    private _scrollToItem;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    willUpdate(changedProperties: PropertyValues<this>): void;
    private accessor _activeItem;
    accessor abortController: AbortController;
    accessor context: InnerSlashMenuContext;
    accessor depth: number;
    accessor mainMenuStyle: Parameters<typeof styleMap>[0] | null;
    accessor menu: SlashMenuItem[];
}
export {};
//# sourceMappingURL=slash-menu-popover.d.ts.map