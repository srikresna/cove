import { EmbedGithubBlockHtmlAdapterExtension } from './html.js';
import { EmbedGithubMarkdownAdapterExtension } from './markdown.js';
import { EmbedGithubBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { EmbedGithubBlockPlainTextAdapterExtension } from './plain-text.js';
export const EmbedGithubBlockAdapterExtensions = [
    EmbedGithubBlockHtmlAdapterExtension,
    EmbedGithubMarkdownAdapterExtension,
    EmbedGithubBlockPlainTextAdapterExtension,
    EmbedGithubBlockNotionHtmlAdapterExtension,
];
