import { BlockModel } from '@blocksuite/store';
import { defineEmbedModel } from '../../../utils/index.js';
export const EmbedLinkedDocStyles = [
    'vertical',
    'horizontal',
    'list',
    'cube',
    'horizontalThin',
    'citation',
];
export class EmbedLinkedDocModel extends defineEmbedModel(BlockModel) {
}
