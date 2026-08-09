import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { type CalloutBlockModel } from '@blocksuite/affine-model';
import type { UniComponent } from '@blocksuite/affine-shared/types';
import type { BlockComponent } from '@blocksuite/std';
import { type Signal } from '@preact/signals-core';
import type { TemplateResult } from 'lit';
import { type StyleInfo } from 'lit/directives/style-map.js';
export declare const renderUniLit: <Props, Expose extends NonNullable<unknown>>(uni: UniComponent<Props, Expose> | undefined, props?: Props, options?: {
    ref?: Signal<Expose | undefined>;
    style?: Readonly<StyleInfo>;
    class?: string;
}) => TemplateResult;
export declare class CalloutBlockComponent extends CaptionedBlockComponent<CalloutBlockModel> {
    private _popupCloseHandler;
    connectedCallback(): void;
    private _getEmojiMarginTop;
    private _closeIconPicker;
    private _toggleIconPicker;
    private readonly _handleBlockClick;
    get attributeRenderer(): import("@blocksuite/std/inline").AttributeRenderer<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get attributesSchema(): import("zod").ZodType<any, import("zod").ZodTypeDef, any>;
    get embedChecker(): (delta: import("@blocksuite/store").DeltaInsert<import("@blocksuite/affine-shared/types").AffineTextAttributes>) => boolean;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get topContenteditableElement(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    renderBlock(): TemplateResult<1>;
}
//# sourceMappingURL=callout-block.d.ts.map