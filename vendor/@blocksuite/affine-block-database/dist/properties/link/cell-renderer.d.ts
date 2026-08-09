import { BaseCellRenderer } from '@blocksuite/data-view';
import { type PropertyValues } from 'lit';
export declare class LinkCell extends BaseCellRenderer<string, string> {
    protected firstUpdated(_changedProperties: PropertyValues): void;
    private readonly _onEdit;
    private readonly _focusEnd;
    private readonly _onKeydown;
    private readonly _setValue;
    openDoc: (e: MouseEvent) => void;
    get std(): import("@blocksuite/std").BlockStdScope | undefined;
    docId$: import("@preact/signals-core").ReadonlySignal<string | undefined>;
    private readonly _container;
    afterEnterEditingMode(): void;
    beforeExitEditingMode(): void;
    parseDocUrl(url: string): ({
        docId: string;
    } & {
        mode?: "edgeless" | "page" | undefined;
        blockIds?: string[] | undefined;
        elementIds?: string[] | undefined;
        databaseId?: string | undefined;
        databaseRowId?: string | undefined;
        xywh?: `[${number},${number},${number},${number}]` | undefined;
        commentId?: string | undefined;
    }) | undefined;
    docName$: import("@preact/signals-core").ReadonlySignal<string | undefined>;
    renderLink(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const linkColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"link", {}, string, string>;
//# sourceMappingURL=cell-renderer.d.ts.map