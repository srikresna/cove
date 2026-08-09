import { EmbedGithubBlockSchema, EmbedGithubStyles, } from '@blocksuite/affine-model';
import { EmbedOptionConfig, LinkPreviewServiceIdentifier, } from '@blocksuite/affine-shared/services';
import { BlockService } from '@blocksuite/std';
import { githubUrlRegex } from './embed-github-model.js';
import { queryEmbedGithubApiData, queryEmbedGithubData } from './utils.js';
export class EmbedGithubBlockService extends BlockService {
    constructor() {
        super(...arguments);
        this.queryApiData = (embedGithubModel, signal) => {
            return queryEmbedGithubApiData(embedGithubModel, signal);
        };
        this.queryUrlData = (embedGithubModel, signal) => {
            return queryEmbedGithubData(embedGithubModel, this.std.get(LinkPreviewServiceIdentifier), signal);
        };
    }
    static { this.flavour = EmbedGithubBlockSchema.model.flavour; }
}
export const EmbedGithubBlockOptionConfig = EmbedOptionConfig({
    flavour: EmbedGithubBlockSchema.model.flavour,
    urlRegex: githubUrlRegex,
    styles: EmbedGithubStyles,
    viewType: 'card',
});
