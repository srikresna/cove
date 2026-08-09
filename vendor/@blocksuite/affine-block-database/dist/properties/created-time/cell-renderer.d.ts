import { BaseCellRenderer } from '@blocksuite/data-view';
export declare class CreatedTimeCell extends BaseCellRenderer<number, number> {
    renderContent(): import("lit-html").TemplateResult<1>;
    connectedCallback(): void;
    beforeEnterEditMode(): boolean;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const createdTimeColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"created-time", {}, number | null, number | null>;
//# sourceMappingURL=cell-renderer.d.ts.map