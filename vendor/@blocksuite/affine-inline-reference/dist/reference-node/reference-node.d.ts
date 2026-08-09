import type { ReferenceInfo } from '@blocksuite/affine-model';
import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import type { BlockComponent, BlockStdScope } from '@blocksuite/std';
import { ShadowlessElement } from '@blocksuite/std';
import type { DeltaInsert, DocMeta, Store } from '@blocksuite/store';
import { nothing } from 'lit';
import type { ReferenceNodeConfigProvider } from './reference-config';
import type { DocLinkClickedEvent } from './types';
declare const AffineReference_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineReference extends AffineReference_base {
    static styles: import("lit").CSSResult;
    get docTitle(): string;
    private readonly _updateRefMeta;
    accessor refMeta: DocMeta | undefined;
    get _icon(): import("lit-html").TemplateResult;
    get _title(): string | undefined;
    get block(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    get customContent(): ((reference: AffineReference) => import("lit-html").TemplateResult) | undefined;
    get doc(): Store;
    get inlineEditor(): import("@blocksuite/std/inline").InlineEditor<AffineTextAttributes> | undefined;
    get referenceInfo(): ReferenceInfo;
    get selfInlineRange(): import("@blocksuite/std/inline").InlineRange | null | undefined;
    readonly open: (event?: Partial<DocLinkClickedEvent>) => void;
    _whenHover: {
        setReference: (element?: Element) => void;
        setFloating: (element?: Element) => void;
        dispose: () => void;
    };
    connectedCallback(): void;
    referenceToNode(): boolean;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    willUpdate(_changedProperties: Map<PropertyKey, unknown>): void;
    accessor config: ReferenceNodeConfigProvider;
    accessor delta: DeltaInsert<AffineTextAttributes>;
    accessor selected: boolean;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=reference-node.d.ts.map