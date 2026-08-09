import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { BlockAdapterMatcher, TextBuffer } from '../types/adapter.js';
export type BlockPlainTextAdapterMatcher = BlockAdapterMatcher<TextBuffer>;
export declare const BlockPlainTextAdapterMatcherIdentifier: ServiceIdentifier<BlockPlainTextAdapterMatcher> & (<U extends BlockPlainTextAdapterMatcher = BlockPlainTextAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function BlockPlainTextAdapterExtension(matcher: BlockPlainTextAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<BlockPlainTextAdapterMatcher>;
};
//# sourceMappingURL=block-adapter.d.ts.map