import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { ReferenceInlineSpecExtension } from './inline-spec';
import { RefNodeSlotsExtension } from './reference-node';
import { referenceNodeToolbar } from './toolbar';
export class ReferenceViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-reference-inline';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(referenceNodeToolbar);
        context.register(ReferenceInlineSpecExtension);
        context.register(RefNodeSlotsExtension);
    }
}
