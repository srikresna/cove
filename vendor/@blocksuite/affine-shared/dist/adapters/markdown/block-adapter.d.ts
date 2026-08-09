import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { BlockAdapterMatcher } from '../types/adapter.js';
import type { MarkdownDeltaConverter } from './delta-converter.js';
import type { MarkdownAST } from './type.js';
export type BlockMarkdownAdapterMatcher = BlockAdapterMatcher<MarkdownAST, MarkdownDeltaConverter>;
export declare const BlockMarkdownAdapterMatcherIdentifier: ServiceIdentifier<BlockMarkdownAdapterMatcher> & (<U extends BlockMarkdownAdapterMatcher = BlockMarkdownAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function BlockMarkdownAdapterExtension(matcher: BlockMarkdownAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<BlockMarkdownAdapterMatcher>;
};
//# sourceMappingURL=block-adapter.d.ts.map