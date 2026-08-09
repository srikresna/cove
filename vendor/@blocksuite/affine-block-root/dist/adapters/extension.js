import { RootBlockHtmlAdapterExtension } from './html.js';
import { RootBlockMarkdownAdapterExtension } from './markdown.js';
import { RootBlockNotionHtmlAdapterExtension } from './notion-html.js';
export const RootBlockAdapterExtensions = [
    RootBlockHtmlAdapterExtension,
    RootBlockMarkdownAdapterExtension,
    RootBlockNotionHtmlAdapterExtension,
];
