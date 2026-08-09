import { EmbedFigmaBlockHtmlAdapterExtension } from './html.js';
import { EmbedFigmaMarkdownAdapterExtension } from './markdown.js';
import { EmbedFigmaBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { EmbedFigmaBlockPlainTextAdapterExtension } from './plain-text.js';
export const EmbedFigmaBlockAdapterExtensions = [
    EmbedFigmaBlockHtmlAdapterExtension,
    EmbedFigmaMarkdownAdapterExtension,
    EmbedFigmaBlockPlainTextAdapterExtension,
    EmbedFigmaBlockNotionHtmlAdapterExtension,
];
