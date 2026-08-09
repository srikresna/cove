import '@blocksuite/affine-shared/commands';
import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import type { ListBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { type TemplateResult } from 'lit';
export declare class ListBlockComponent extends CaptionedBlockComponent<ListBlockModel> {
    static styles: import("lit").CSSResult;
    private _inlineRangeProvider;
    private readonly _onClickIcon;
    get attributeRenderer(): import("@blocksuite/std/inline").AttributeRenderer<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get attributesSchema(): import("zod").ZodType<any, import("zod").ZodTypeDef, any>;
    get embedChecker(): (delta: import("@blocksuite/store").DeltaInsert<import("@blocksuite/affine-shared/types").AffineTextAttributes>) => boolean;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    private _select;
    connectedCallback(): void;
    getUpdateComplete(): Promise<boolean>;
    renderBlock(): TemplateResult<1>;
    private accessor _readonlyCollapsed;
    private accessor _richTextElement;
    accessor blockContainerStyles: {
        margin: string;
    };
}
//# sourceMappingURL=list-block.d.ts.map