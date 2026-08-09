import { EmbedLoomBlockSchema, EmbedLoomStyles, } from '@blocksuite/affine-model';
import { EmbedOptionConfig } from '@blocksuite/affine-shared/services';
import { BlockService } from '@blocksuite/std';
import { loomUrlRegex } from './embed-loom-model.js';
import { queryEmbedLoomData } from './utils.js';
export class EmbedLoomBlockService extends BlockService {
    constructor() {
        super(...arguments);
        this.queryUrlData = (embedLoomModel, signal) => {
            return queryEmbedLoomData(embedLoomModel, signal);
        };
    }
    static { this.flavour = EmbedLoomBlockSchema.model.flavour; }
}
export const EmbedLoomBlockOptionConfig = EmbedOptionConfig({
    flavour: EmbedLoomBlockSchema.model.flavour,
    urlRegex: loomUrlRegex,
    styles: EmbedLoomStyles,
    viewType: 'embed',
});
