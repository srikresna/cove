import { BookmarkBlockHtmlAdapterExtension } from './html.js';
import { BookmarkBlockMarkdownAdapterExtensions } from './markdown/index.js';
import { BookmarkBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { BookmarkBlockPlainTextAdapterExtension } from './plain-text.js';
export const BookmarkBlockAdapterExtensions = [
    BookmarkBlockHtmlAdapterExtension,
    BookmarkBlockMarkdownAdapterExtensions,
    BookmarkBlockNotionHtmlAdapterExtension,
    BookmarkBlockPlainTextAdapterExtension,
].flat();
