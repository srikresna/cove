import { EmbedYoutubeBlockHtmlAdapterExtension } from './html.js';
import { EmbedYoutubeMarkdownAdapterExtension } from './markdown.js';
import { EmbedYoutubeBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { EmbedYoutubeBlockPlainTextAdapterExtension } from './plain-text.js';
export const EmbedYoutubeBlockAdapterExtensions = [
    EmbedYoutubeBlockHtmlAdapterExtension,
    EmbedYoutubeMarkdownAdapterExtension,
    EmbedYoutubeBlockPlainTextAdapterExtension,
    EmbedYoutubeBlockNotionHtmlAdapterExtension,
];
