import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { groupToMarkdownAdapterMatcher, groupToPlainTextAdapterMatcher, } from './adapter';
import { groupRelationWatcherExtension } from './group-watcher';
export class GroupStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-group-gfx';
    }
    setup(context) {
        super.setup(context);
        context.register(groupToPlainTextAdapterMatcher);
        context.register(groupToMarkdownAdapterMatcher);
        context.register(groupRelationWatcherExtension);
    }
}
