import type { TextBuffer } from '@blocksuite/affine-shared/adapters';
import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { ElementModelMatcher } from '../../type.js';
export type ElementToPlainTextAdapterMatcher = ElementModelMatcher<TextBuffer>;
export declare const ElementToPlainTextAdapterMatcherIdentifier: ServiceIdentifier<ElementToPlainTextAdapterMatcher> & (<U extends ElementToPlainTextAdapterMatcher = ElementToPlainTextAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function ElementToPlainTextAdapterExtension(matcher: ElementToPlainTextAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<ElementToPlainTextAdapterMatcher>;
};
//# sourceMappingURL=type.d.ts.map