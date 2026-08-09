import { ShadowlessElement } from '@blocksuite/std';
import type { BookmarkBlockComponent } from '../bookmark-block.js';
declare const BookmarkCard_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class BookmarkCard extends BookmarkCard_base {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor bookmark: BookmarkBlockComponent;
    accessor error: boolean;
    accessor loading: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'bookmark-card': BookmarkCard;
    }
}
export {};
//# sourceMappingURL=bookmark-card.d.ts.map