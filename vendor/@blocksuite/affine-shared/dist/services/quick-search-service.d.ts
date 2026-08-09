import type { ReferenceParams } from '@blocksuite/affine-model';
import type { ExtensionType } from '@blocksuite/store';
export interface QuickSearchService {
    openQuickSearch: () => Promise<QuickSearchResult>;
}
export type QuickSearchResult = {
    docId: string;
    params?: ReferenceParams;
} | {
    externalUrl: string;
} | null;
export declare const QuickSearchProvider: import("@blocksuite/global/di").ServiceIdentifier<QuickSearchService> & (<U extends QuickSearchService = QuickSearchService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function QuickSearchExtension(quickSearchService: QuickSearchService): ExtensionType;
//# sourceMappingURL=quick-search-service.d.ts.map