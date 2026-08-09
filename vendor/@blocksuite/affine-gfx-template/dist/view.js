import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { TemplateTool } from './template-tool';
import { templateSeniorTool } from './toolbar/senior-tool';
export class TemplateViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-template-view';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(TemplateTool);
            context.register(templateSeniorTool);
        }
    }
}
