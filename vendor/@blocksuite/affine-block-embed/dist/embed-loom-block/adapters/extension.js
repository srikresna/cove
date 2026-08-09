import { EmbedLoomBlockHtmlAdapterExtension } from './html.js';
import { EmbedLoomMarkdownAdapterExtension } from './markdown.js';
import { EmbedLoomBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { EmbedLoomBlockPlainTextAdapterExtension } from './plain-text.js';
export const EmbedLoomBlockAdapterExtensions = [
    EmbedLoomBlockHtmlAdapterExtension,
    EmbedLoomMarkdownAdapterExtension,
    EmbedLoomBlockPlainTextAdapterExtension,
    EmbedLoomBlockNotionHtmlAdapterExtension,
];
