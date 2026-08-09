import type { EmbedIframeBlockModel } from '@blocksuite/affine-model';
import { type BlockStdScope } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EmbedIframeLinkInputBase_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EmbedIframeLinkInputBase extends EmbedIframeLinkInputBase_base {
    protected track(status: 'success' | 'failure'): void;
    protected isInputEmpty(): boolean;
    protected tryToAddBookmark(url: string): void;
    protected onConfirm(): Promise<void>;
    protected handleInput: (e: InputEvent) => void;
    protected handleKeyDown: (e: KeyboardEvent) => Promise<void>;
    connectedCallback(): void;
    get store(): import("@blocksuite/store").Store;
    get notificationService(): import("@blocksuite/affine-shared/services").NotificationService | null;
    protected accessor _linkInputValue: string;
    accessor input: HTMLInputElement;
    accessor model: EmbedIframeBlockModel;
    accessor std: BlockStdScope;
    accessor abortController: AbortController | undefined;
    accessor inSurface: boolean;
}
export {};
//# sourceMappingURL=embed-iframe-link-input-base.d.ts.map