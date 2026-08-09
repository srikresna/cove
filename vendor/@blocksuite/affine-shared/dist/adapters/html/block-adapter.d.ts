import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { BlockAdapterMatcher } from '../types/adapter.js';
import type { HtmlAST } from '../types/hast.js';
import type { HtmlDeltaConverter } from './delta-converter.js';
export type BlockHtmlAdapterMatcher = BlockAdapterMatcher<HtmlAST, HtmlDeltaConverter>;
export declare const BlockHtmlAdapterMatcherIdentifier: ServiceIdentifier<BlockHtmlAdapterMatcher> & (<U extends BlockHtmlAdapterMatcher = BlockHtmlAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function BlockHtmlAdapterExtension(matcher: BlockHtmlAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<BlockHtmlAdapterMatcher>;
};
//# sourceMappingURL=block-adapter.d.ts.map