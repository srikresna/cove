import type { AliasInfo, ReferenceParams } from '@blocksuite/affine-model';
import { type Container } from '@blocksuite/global/di';
import { type DisposableMember } from '@blocksuite/global/disposable';
import { LifeCycleWatcher } from '@blocksuite/std';
import type { Store } from '@blocksuite/store';
import { type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { TemplateResult } from 'lit';
export type DocDisplayMetaParams = {
    referenced?: boolean;
    params?: ReferenceParams;
} & AliasInfo;
/**
 * Customize document display title and icon.
 *
 * Supports the following blocks:
 *
 * * Inline View:
 *      `AffineReference`
 * * Card View:
 *      `EmbedLinkedDocBlockComponent`
 *      `EmbedEdgelessLinkedDocBlockComponent`
 * * Embed View:
 *      `EmbedSyncedDocBlockComponent`
 *      `EmbedEdgelessSyncedDocBlockComponent`
 */
export interface DocDisplayMetaExtension {
    icon: (docId: string, referenceInfo?: DocDisplayMetaParams) => ReadonlySignal<TemplateResult>;
    title: (docId: string, referenceInfo?: DocDisplayMetaParams) => ReadonlySignal<string>;
}
export declare const DocDisplayMetaProvider: import("@blocksuite/global/di").ServiceIdentifier<DocDisplayMetaExtension> & (<U extends DocDisplayMetaExtension = DocDisplayMetaExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class DocDisplayMetaService extends LifeCycleWatcher implements DocDisplayMetaExtension {
    static icons: {
        readonly deleted: TemplateResult<1>;
        readonly aliased: TemplateResult<1>;
        readonly page: TemplateResult<1>;
        readonly edgeless: TemplateResult<1>;
        readonly linkedBlock: TemplateResult<1>;
        readonly linkedPage: TemplateResult<1>;
        readonly linkedEdgeless: TemplateResult<1>;
    };
    static key: string;
    readonly disposables: DisposableMember[];
    readonly iconMap: WeakMap<Store, Signal<TemplateResult>>;
    readonly titleMap: WeakMap<Store, Signal<string>>;
    static setup(di: Container): void;
    dispose(): void;
    icon(pageId: string, { params, title, referenced }?: DocDisplayMetaParams): ReadonlySignal<TemplateResult>;
    title(pageId: string, { title }?: DocDisplayMetaParams): ReadonlySignal<string>;
    unmounted(): void;
}
//# sourceMappingURL=doc-display-meta-service.d.ts.map