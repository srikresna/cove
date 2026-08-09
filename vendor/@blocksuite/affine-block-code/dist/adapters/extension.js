import { CodeBlockHtmlAdapterExtension } from './html.js';
import { CodeBlockMarkdownAdapterExtensions } from './markdown/index.js';
import { CodeBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { CodeBlockPlainTextAdapterExtension } from './plain-text.js';
export const CodeBlockAdapterExtensions = [
    CodeBlockHtmlAdapterExtension,
    CodeBlockMarkdownAdapterExtensions,
    CodeBlockPlainTextAdapterExtension,
    CodeBlockNotionHtmlAdapterExtension,
].flat();
