import { BaseCellRenderer } from '@blocksuite/data-view';
import type { DeltaInsert, Text } from '@blocksuite/store';
export declare class HeaderAreaTextCell extends BaseCellRenderer<Text, string> {
    activity: boolean;
    docId$: import("@preact/signals-core").Signal<string | undefined>;
    get host(): import("@blocksuite/std").EditorHost | null;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null | undefined;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes> | undefined;
    get topContenteditableElement(): import("@blocksuite/std").BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null | undefined;
    get std(): import("@blocksuite/std").BlockStdScope | undefined;
    private readonly _onCopy;
    private readonly _onCut;
    private readonly _onPaste;
    insertDelta: (delta: DeltaInsert) => void;
    connectedCallback(): void;
    private readonly _handleKeyDown;
    firstUpdated(props: Map<string, unknown>): void;
    afterEnterEditingMode(): void;
    protected render(): unknown;
    renderBlockText(): import("lit-html").TemplateResult;
    icon$: import("@preact/signals-core").ReadonlySignal<{} | undefined>;
    renderIcon(): import("lit-html").TemplateResult | undefined;
    private readonly richText;
    accessor showIcon: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-header-area-text': HeaderAreaTextCell;
    }
}
//# sourceMappingURL=text.d.ts.map