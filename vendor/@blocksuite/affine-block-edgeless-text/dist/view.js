import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { EdgelessClipboardEdgelessTextConfig } from './edgeless-clipboard-config';
import { EdgelessTextInteraction } from './edgeless-text-block';
import { edgelessTextToolbarExtension } from './edgeless-toolbar';
import { effects } from './effects';
export class EdgelessTextViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-text-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        const isEdgeless = this.isEdgeless(context.scope);
        if (isEdgeless) {
            context.register([
                BlockViewExtension('affine:edgeless-text', literal `affine-edgeless-text`),
            ]);
            context.register(edgelessTextToolbarExtension);
            context.register(EdgelessClipboardEdgelessTextConfig);
            context.register(EdgelessTextInteraction);
        }
    }
}
