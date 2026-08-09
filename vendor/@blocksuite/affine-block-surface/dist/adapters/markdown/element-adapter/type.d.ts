import type { ExtensionType } from '@blocksuite/affine/store';
import type { MarkdownAST } from '@blocksuite/affine-shared/adapters';
import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ElementModelMatcher } from '../../type.js';
export type ElementToMarkdownAdapterMatcher = ElementModelMatcher<MarkdownAST>;
export declare const ElementToMarkdownAdapterMatcherIdentifier: ServiceIdentifier<ElementToMarkdownAdapterMatcher> & (<U extends ElementToMarkdownAdapterMatcher = ElementToMarkdownAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function ElementToMarkdownAdapterExtension(matcher: ElementToMarkdownAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<ElementToMarkdownAdapterMatcher>;
};
//# sourceMappingURL=type.d.ts.map