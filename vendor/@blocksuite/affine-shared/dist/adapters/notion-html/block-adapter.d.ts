import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { BlockAdapterMatcher } from '../types/adapter.js';
import type { HtmlAST } from '../types/hast.js';
import type { NotionHtmlDeltaConverter } from './delta-converter.js';
export type BlockNotionHtmlAdapterMatcher = BlockAdapterMatcher<HtmlAST, NotionHtmlDeltaConverter>;
export declare const BlockNotionHtmlAdapterMatcherIdentifier: ServiceIdentifier<BlockNotionHtmlAdapterMatcher> & (<U extends BlockNotionHtmlAdapterMatcher = BlockNotionHtmlAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function BlockNotionHtmlAdapterExtension(matcher: BlockNotionHtmlAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<BlockNotionHtmlAdapterMatcher>;
};
//# sourceMappingURL=block-adapter.d.ts.map