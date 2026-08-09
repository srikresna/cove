import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import type { ParagraphBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { type TemplateResult } from 'lit';
export declare class ParagraphBlockComponent extends CaptionedBlockComponent<ParagraphBlockModel> {
    static styles: import("lit").CSSResult;
    focused$: import("@preact/signals-core").ReadonlySignal<boolean>;
    private readonly _composing;
    private readonly _displayPlaceholder;
    private _inlineRangeProvider;
    private readonly _isInDatabase;
    private get _placeholder();
    get citationService(): import("@blocksuite/affine-shared/services").CitationViewService;
    get attributeRenderer(): import("@blocksuite/std/inline").AttributeRenderer<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get attributesSchema(): import("zod").ZodType<any, import("zod").ZodTypeDef, any>;
    get collapsedSiblings(): import("@blocksuite/store").BlockModel<object>[];
    get embedChecker(): (delta: import("@blocksuite/store").DeltaInsert<import("@blocksuite/affine-shared/types").AffineTextAttributes>) => boolean;
    get inEdgelessText(): boolean;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null | undefined;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get hasCitationSiblings(): boolean;
    get isCommentHighlighted(): boolean;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    connectedCallback(): void;
    getUpdateComplete(): Promise<boolean>;
    renderBlock(): TemplateResult<1>;
    private accessor _readonlyCollapsed;
    private accessor _richTextElement;
    accessor blockContainerStyles: {
        margin: string;
    };
}
//# sourceMappingURL=paragraph-block.d.ts.map