import { AttachmentBlockMarkdownAdapterExtension } from './markdown.js';
import { AttachmentBlockNotionHtmlAdapterExtension } from './notion-html.js';
export const AttachmentBlockAdapterExtensions = [
    AttachmentBlockNotionHtmlAdapterExtension,
    AttachmentBlockMarkdownAdapterExtension,
];
