import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import type { CodeBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { type Signal } from '@preact/signals-core';
import { type TemplateResult } from 'lit';
import { type ThemedToken } from 'shiki';
import { CodeBlockHighlighter } from './code-block-service.js';
export declare class CodeBlockComponent extends CaptionedBlockComponent<CodeBlockModel> {
    static styles: import("lit").CSSResult;
    private _inlineRangeProvider;
    private readonly _localPreview$;
    preview$: Signal<boolean>;
    collapsed$: Signal<boolean>;
    highlightTokens$: Signal<ThemedToken[][]>;
    languageName$: Signal<string>;
    get inlineEditor(): import("@blocksuite/std/inline").InlineEditor<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }> | undefined;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get notificationService(): import("@blocksuite/affine-shared/services").NotificationService | null;
    get readonly(): boolean;
    get langs(): import("shiki").BundledLanguageInfo[];
    get highlighter(): CodeBlockHighlighter;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    private _updateHighlightTokens;
    connectedCallback(): void;
    copyCode(): void;
    get isCommentHighlighted(): boolean;
    getUpdateComplete(): Promise<boolean>;
    renderBlock(): TemplateResult<1>;
    setWrap(wrap: boolean): void;
    setCollapsed(collapsed: boolean): void;
    private accessor _richTextElement;
    accessor blockContainerStyles: {
        margin: string;
    };
    accessor useCaptionEditor: boolean;
    accessor useZeroWidth: boolean;
    setPreviewState(preview: boolean): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-code': CodeBlockComponent;
    }
}
//# sourceMappingURL=code-block.d.ts.map