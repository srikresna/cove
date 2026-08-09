import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { connectorToMarkdownAdapterMatcher, connectorToPlainTextAdapterMatcher, } from './adapter';
import { connectorWatcherExtension } from './connector-watcher';
export class ConnectorStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-connector-gfx';
    }
    setup(context) {
        super.setup(context);
        context.register(connectorToPlainTextAdapterMatcher);
        context.register(connectorToMarkdownAdapterMatcher);
        context.register(connectorWatcherExtension);
    }
}
