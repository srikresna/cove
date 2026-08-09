import type { AffineInlineEditor, AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { BaseCellRenderer } from '@blocksuite/data-view';
import type { DeltaInsert } from '@blocksuite/store';
import { Text } from '@blocksuite/store';
export declare class RichTextCell extends BaseCellRenderer<Text, string> {
    inlineEditor$: import("@preact/signals-core").ReadonlySignal<AffineInlineEditor | null | undefined>;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<AffineTextAttributes> | undefined;
    get topContenteditableElement(): import("@blocksuite/std").BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null | undefined;
    get host(): import("@blocksuite/std").EditorHost | null;
    private readonly richText$;
    private changeUserSelectAccordToReadOnly;
    private readonly _handleKeyDown;
    private readonly _initYText;
    private readonly _onSoftEnter;
    private readonly _onCopy;
    private readonly _onCut;
    private readonly _onPaste;
    connectedCallback(): void;
    beforeEnterEditMode(): boolean;
    afterEnterEditingMode(): void;
    render(): import("lit-html").TemplateResult;
    private get std();
    insertDelta: (delta: DeltaInsert<AffineTextAttributes>) => void;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-rich-text-cell': RichTextCell;
    }
}
export declare const richTextColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"rich-text", {}, import("./define.js").RichTextCellType | undefined, string>;
//# sourceMappingURL=cell-renderer.d.ts.map