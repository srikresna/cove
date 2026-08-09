import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { LatexEditorUnitSpecExtension, LatexInlineSpecExtension, } from './inline-spec';
import { LatexEditorInlineManagerExtension } from './latex-node/latex-editor-menu';
export class LatexViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-latex-inline';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            LatexInlineSpecExtension,
            LatexEditorUnitSpecExtension,
            LatexEditorInlineManagerExtension,
        ]);
    }
}
