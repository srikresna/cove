import { createIdentifier, } from '@blocksuite/global/di';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { rehypeInlineToBlock, rehypeWrapInlineElements, } from '../html/rehype-plugins/index.js';
import { DeltaASTConverter, } from '../types/delta-converter.js';
const INLINE_HTML_TAGS = new Set([
    'span',
    'strong',
    'b',
    'em',
    'i',
    'del',
    'u',
    'mark',
    'code',
    'ins',
    'bdi',
    'bdo',
]);
const VOID_HTML_TAGS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);
const ALLOWED_INLINE_HTML_TAGS = new Set([
    ...INLINE_HTML_TAGS,
    ...VOID_HTML_TAGS,
]);
const isHtmlNode = (node) => node.type === 'html' && 'value' in node && typeof node.value === 'string';
const isTextNode = (node) => node.type === 'text' && 'value' in node && typeof node.value === 'string';
const getHtmlTagInfo = (value) => {
    const closingMatch = value.match(/^<\/([A-Za-z][A-Za-z0-9-]*)\s*>$/);
    if (closingMatch) {
        return {
            name: closingMatch[1].toLowerCase(),
            kind: 'close',
        };
    }
    const selfClosingMatch = value.match(/^<([A-Za-z][A-Za-z0-9-]*)(\s[^>]*)?\/>$/i);
    if (selfClosingMatch) {
        return {
            name: selfClosingMatch[1].toLowerCase(),
            kind: 'self',
        };
    }
    const openingMatch = value.match(/^<([A-Za-z][A-Za-z0-9-]*)(\s[^>]*)?>$/);
    if (openingMatch) {
        const name = openingMatch[1].toLowerCase();
        return {
            name,
            kind: VOID_HTML_TAGS.has(name) ? 'self' : 'open',
        };
    }
    return null;
};
export const InlineDeltaToMarkdownAdapterMatcherIdentifier = createIdentifier('InlineDeltaToMarkdownAdapterMatcher');
export function InlineDeltaToMarkdownAdapterExtension(matcher) {
    const identifier = InlineDeltaToMarkdownAdapterMatcherIdentifier(matcher.name);
    return {
        setup: di => {
            di.addImpl(identifier, () => matcher);
        },
        identifier,
    };
}
export const MarkdownASTToDeltaMatcherIdentifier = createIdentifier('MarkdownASTToDeltaMatcher');
export function MarkdownASTToDeltaExtension(matcher) {
    const identifier = MarkdownASTToDeltaMatcherIdentifier(matcher.name);
    return {
        setup: di => {
            di.addImpl(identifier, () => matcher);
        },
        identifier,
    };
}
export class MarkdownDeltaConverter extends DeltaASTConverter {
    constructor(configs, inlineDeltaMatchers, markdownASTToDeltaMatchers, htmlDeltaConverter) {
        super();
        this.configs = configs;
        this.inlineDeltaMatchers = inlineDeltaMatchers;
        this.markdownASTToDeltaMatchers = markdownASTToDeltaMatchers;
        this.htmlDeltaConverter = htmlDeltaConverter;
    }
    _convertHtmlToDelta(html) {
        if (!this.htmlDeltaConverter) {
            return [{ insert: html }];
        }
        try {
            const processor = unified()
                .use(rehypeParse, { fragment: true })
                .use(rehypeInlineToBlock)
                .use(rehypeWrapInlineElements);
            const ast = processor.runSync(processor.parse(html));
            return this.htmlDeltaConverter.astToDelta(ast, { trim: false });
        }
        catch {
            return [{ insert: html }];
        }
    }
    applyTextFormatting(delta) {
        let mdast = {
            type: 'text',
            value: delta.attributes?.underline
                ? `<u>${delta.insert}</u>`
                : delta.insert,
        };
        const context = {
            configs: this.configs,
            current: mdast,
        };
        for (const matcher of this.inlineDeltaMatchers) {
            if (matcher.match(delta)) {
                mdast = matcher.toAST(delta, context);
                context.current = mdast;
            }
        }
        return mdast;
    }
    _mergeInlineHtml(children, startIndex) {
        const startNode = children[startIndex];
        if (!isHtmlNode(startNode)) {
            return null;
        }
        const startTag = getHtmlTagInfo(startNode.value);
        if (!startTag ||
            startTag.kind !== 'open' ||
            !INLINE_HTML_TAGS.has(startTag.name)) {
            return null;
        }
        const stack = [startTag.name];
        let html = startNode.value;
        let endIndex = startIndex;
        for (let i = startIndex + 1; i < children.length; i++) {
            const node = children[i];
            if (isHtmlNode(node)) {
                const info = getHtmlTagInfo(node.value);
                if (!info) {
                    html += node.value;
                    continue;
                }
                if (info.kind === 'open') {
                    if (!ALLOWED_INLINE_HTML_TAGS.has(info.name)) {
                        return null;
                    }
                    stack.push(info.name);
                    html += node.value;
                    continue;
                }
                if (info.kind === 'self') {
                    if (!ALLOWED_INLINE_HTML_TAGS.has(info.name)) {
                        return null;
                    }
                    html += node.value;
                    continue;
                }
                if (!ALLOWED_INLINE_HTML_TAGS.has(info.name)) {
                    return null;
                }
                const last = stack[stack.length - 1];
                if (last !== info.name) {
                    return null;
                }
                stack.pop();
                html += node.value;
                endIndex = i;
                if (stack.length === 0) {
                    return {
                        endIndex,
                        deltas: this._convertHtmlToDelta(html),
                    };
                }
                continue;
            }
            if (isTextNode(node)) {
                html += node.value;
                continue;
            }
            return null;
        }
        return null;
    }
    _astChildrenToDelta(children) {
        const deltas = [];
        for (let i = 0; i < children.length; i++) {
            const merged = this._mergeInlineHtml(children, i);
            if (merged) {
                deltas.push(...merged.deltas);
                i = merged.endIndex;
                continue;
            }
            deltas.push(...this.astToDelta(children[i]));
        }
        return deltas;
    }
    astToDelta(ast) {
        const context = {
            configs: this.configs,
            options: Object.create(null),
            toDelta: (ast) => this.astToDelta(ast),
            htmlToDelta: (html) => this._convertHtmlToDelta(html),
        };
        for (const matcher of this.markdownASTToDeltaMatchers) {
            if (matcher.match(ast)) {
                return matcher.toDelta(ast, context);
            }
        }
        return 'children' in ast
            ? this._astChildrenToDelta(ast.children)
            : [];
    }
    deltaToAST(deltas, depth = 0) {
        if (depth > 0) {
            deltas.unshift({ insert: ' '.repeat(4).repeat(depth) });
        }
        return deltas.map(delta => this.applyTextFormatting(delta));
    }
}
