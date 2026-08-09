import type { DetailSlotProps } from '@blocksuite/data-view';
import type { KanbanSingleView, TableSingleView } from '@blocksuite/data-view/view-presets';
import type { EditorHost } from '@blocksuite/std';
import { ShadowlessElement } from '@blocksuite/std';
declare const BlockRenderer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class BlockRenderer extends BlockRenderer_base implements DetailSlotProps {
    static styles: import("lit").CSSResult;
    get attributeRenderer(): import("@blocksuite/std/inline").AttributeRenderer<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get attributesSchema(): import("zod").ZodType<any, import("zod").ZodTypeDef, any>;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<import("@blocksuite/affine-shared/types").AffineTextAttributes>;
    get model(): import("@blocksuite/store").BlockModel<object> | undefined;
    connectedCallback(): void;
    protected render(): unknown;
    renderIcon(): import("lit-html").TemplateResult<1> | undefined;
    accessor host: EditorHost;
    accessor openDoc: (docId: string) => void;
    accessor rowId: string;
    accessor view: TableSingleView | KanbanSingleView;
}
export {};
//# sourceMappingURL=block-renderer.d.ts.map