import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { NoteTool } from './note-tool';
import { noteSeniorTool } from './toolbar/senior-tool';
export class NoteViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-note-gfx';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(NoteTool);
        context.register(noteSeniorTool);
    }
}
