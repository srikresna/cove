import { StoreExtension } from '@blocksuite/store';
import { EmbedIframeConfigIdentifier, } from './embed-iframe-config';
export class EmbedIframeService extends StoreExtension {
    static { this.key = 'embed-iframe-service'; }
    constructor(store) {
        super(store);
        this.canEmbed = (url) => {
            return this._configs.some(config => config.match(url));
        };
        this.buildOEmbedUrl = (url) => {
            return this._configs.find(config => config.match(url))?.buildOEmbedUrl(url);
        };
        this.getConfig = (url) => {
            return this._configs.find(config => config.match(url));
        };
        this.getEmbedIframeData = async (url, signal) => {
            try {
                const config = this._configs.find(config => config.match(url));
                if (!config) {
                    return null;
                }
                const oEmbedUrl = config.buildOEmbedUrl(url);
                if (!oEmbedUrl) {
                    return null;
                }
                // if the config useOEmbedUrlDirectly is true, return the url directly as iframe_url
                if (config.useOEmbedUrlDirectly) {
                    return {
                        iframe_url: oEmbedUrl,
                    };
                }
                // otherwise, fetch the oEmbed data
                const response = await fetch(oEmbedUrl, { signal });
                if (!response.ok) {
                    console.warn(`Failed to fetch oEmbed data: ${response.status} ${response.statusText}`);
                    return null;
                }
                const data = await response.json();
                return data;
            }
            catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Error fetching embed iframe data:', error);
                }
                return null;
            }
        };
        this.addEmbedIframeBlock = (props, parentId, index) => {
            const blockId = this.store.addBlock('affine:embed-iframe', props, parentId, index);
            return blockId;
        };
        this._configs = Array.from(store.provider.getAll(EmbedIframeConfigIdentifier).values());
    }
}
