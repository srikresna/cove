import { LatexMarkdownAdapterExtensions } from './markdown/index.js';
import { LatexBlockNotionHtmlAdapterExtension } from './notion-html.js';
import { LatexBlockPlainTextAdapterExtension } from './plain-text.js';
export const LatexBlockAdapterExtensions = [
    LatexMarkdownAdapterExtensions,
    LatexBlockNotionHtmlAdapterExtension,
    LatexBlockPlainTextAdapterExtension,
].flat();
