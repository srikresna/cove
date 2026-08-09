import { ElementModelAdapter, } from '../../type.js';
export class MarkdownElementModelAdapter extends ElementModelAdapter {
    constructor(elementModelMatchers) {
        super();
        this.elementModelMatchers = elementModelMatchers;
    }
    fromElementModel(element, context) {
        const markdownAST = null;
        for (const matcher of this.elementModelMatchers) {
            if (matcher.match(element)) {
                return matcher.toAST(element, context);
            }
        }
        return markdownAST;
    }
}
export * from './type.js';
