import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { toolbarWidget } from '.';
import { effects } from './effects';
export class ToolbarViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-toolbar-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isMobile(context.scope))
            return;
        context.register(toolbarWidget);
    }
}
