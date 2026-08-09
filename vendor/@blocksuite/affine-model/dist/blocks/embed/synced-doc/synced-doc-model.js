import { BlockModel } from '@blocksuite/store';
import { defineEmbedModel } from '../../../utils/index.js';
export const EmbedSyncedDocStyles = [
    'syncedDoc',
];
export class EmbedSyncedDocModel extends defineEmbedModel(BlockModel) {
    get isFolded() {
        return !!this.props.preFoldHeight$.value;
    }
}
