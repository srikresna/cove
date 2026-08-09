import { EmbedYoutubeBlockSchema, EmbedYoutubeStyles, } from '@blocksuite/affine-model';
import { EmbedOptionConfig, LinkPreviewServiceIdentifier, } from '@blocksuite/affine-shared/services';
import { BlockService } from '@blocksuite/std';
import { youtubeUrlRegex } from './embed-youtube-model.js';
import { queryEmbedYoutubeData } from './utils.js';
export class EmbedYoutubeBlockService extends BlockService {
    constructor() {
        super(...arguments);
        this.queryUrlData = (embedYoutubeModel, signal) => {
            return queryEmbedYoutubeData(embedYoutubeModel, this.std.get(LinkPreviewServiceIdentifier), signal);
        };
    }
    static { this.flavour = EmbedYoutubeBlockSchema.model.flavour; }
}
export const EmbedYoutubeBlockOptionConfig = EmbedOptionConfig({
    flavour: EmbedYoutubeBlockSchema.model.flavour,
    urlRegex: youtubeUrlRegex,
    styles: EmbedYoutubeStyles,
    viewType: 'embed',
});
