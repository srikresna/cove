import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { DataViewBlockSchema } from './data-view-model';
import { effects } from './effects';
const flavour = DataViewBlockSchema.model.flavour;
export class DataViewViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-data-view-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            FlavourExtension(flavour),
            BlockViewExtension(flavour, literal `affine-data-view`),
        ]);
    }
}
