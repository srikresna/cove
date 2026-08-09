import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { noteSlicerWidget } from './note-slicer';
export class NoteSlicerViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-note-slicer-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(noteSlicerWidget);
        }
    }
}
