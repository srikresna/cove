import { ElementModelAdapter, } from '../../type.js';
export class PlainTextElementModelAdapter extends ElementModelAdapter {
    constructor(elementModelMatchers) {
        super();
        this.elementModelMatchers = elementModelMatchers;
    }
    fromElementModel(element, context) {
        for (const matcher of this.elementModelMatchers) {
            if (matcher.match(element)) {
                return matcher.toAST(element, context)?.content ?? '';
            }
        }
        return '';
    }
}
export * from './type.js';
