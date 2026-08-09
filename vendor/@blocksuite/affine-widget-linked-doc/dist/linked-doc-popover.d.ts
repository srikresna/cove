import type { IconButton } from '@blocksuite/affine-components/icon-button';
import { LitElement } from 'lit';
import type { LinkedDocContext } from './config.js';
declare const LinkedDocPopover_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class LinkedDocPopover extends LinkedDocPopover_base {
    static styles: import("lit").CSSResult;
    private readonly _abort;
    private readonly _expanded;
    private _menusItemsEffectCleanup;
    private readonly _updateLinkedDocGroup;
    private readonly _updateAutoFocusedItem;
    private _updateLinkedDocGroupAbortController;
    private get _actionGroup();
    private get _flattenActionList();
    private get _query();
    private _getActionItems;
    private _isTextOverflowing;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    willUpdate(): void;
    private scrollToFocusedItem;
    get _activatedItemIndex(): number;
    private accessor _activatedItemKey;
    private accessor _linkedDocGroup;
    private accessor _position;
    private accessor _showTooltip;
    accessor context: LinkedDocContext;
    accessor iconButtons: NodeListOf<IconButton>;
    accessor linkedDocElement: Element | null;
}
export {};
//# sourceMappingURL=linked-doc-popover.d.ts.map