import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
export const EmbedOptionProvider = createIdentifier('AffineEmbedOptionProvider');
export const EmbedOptionConfigIdentifier = createIdentifier('AffineEmbedOptionConfig');
export const EmbedOptionConfig = (options) => {
    return {
        setup: di => {
            di.addImpl(EmbedOptionConfigIdentifier(options.flavour), options);
        },
    };
};
export class EmbedOptionService extends Extension {
    constructor(std) {
        super();
        this.std = std;
        this._embedBlockRegistry = new Set();
        this.getEmbedBlockOptions = (url) => {
            const entries = this._embedBlockRegistry.entries();
            for (const [options] of entries) {
                const regex = options.urlRegex;
                if (regex.test(url))
                    return options;
            }
            return null;
        };
        this.registerEmbedBlockOptions = (options) => {
            this._embedBlockRegistry.add(options);
        };
        const configs = this.std.provider.getAll(EmbedOptionConfigIdentifier);
        configs.forEach(value => {
            this.registerEmbedBlockOptions(value);
        });
    }
    static setup(di) {
        di.addImpl(EmbedOptionProvider, EmbedOptionService, [StdIdentifier]);
    }
}
