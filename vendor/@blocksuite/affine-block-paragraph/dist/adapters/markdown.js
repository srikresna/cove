import { ParagraphBlockSchema } from '@blocksuite/affine-model';
import { BlockMarkdownAdapterExtension, IN_PARAGRAPH_NODE_CONTEXT_KEY, isCalloutNode, } from '@blocksuite/affine-shared/adapters';
import { nanoid } from '@blocksuite/store';
const PARAGRAPH_MDAST_TYPE = new Set(['paragraph', 'heading', 'blockquote']);
const isParagraphMDASTType = (node) => PARAGRAPH_MDAST_TYPE.has(node.type);
const joinDeltaLines = (lines, prefix) => {
    const deltas = [];
    lines.forEach(line => {
        if (deltas.length)
            deltas.push({ insert: '\n' });
        if (prefix)
            deltas.push({ insert: prefix });
        deltas.push(...line);
    });
    return deltas;
};
const flattenListItemToDelta = (node, deltaConverter, prefix, depth) => {
    const firstParagraph = node.children[0];
    const lines = [];
    if (firstParagraph?.type === 'paragraph') {
        lines.push([
            { insert: prefix },
            ...deltaConverter.astToDelta(firstParagraph),
        ]);
    }
    else {
        lines.push([{ insert: prefix.trimEnd() }]);
    }
    node.children
        .slice(firstParagraph?.type === 'paragraph' ? 1 : 0)
        .forEach(child => {
        const delta = flattenMarkdownBlockToDelta(child, deltaConverter, depth + 1);
        if (delta.length) {
            lines.push(delta);
        }
    });
    return joinDeltaLines(lines);
};
const flattenMarkdownBlockToDelta = (node, deltaConverter, depth = 0) => {
    switch (node.type) {
        case 'paragraph':
        case 'heading':
            return deltaConverter.astToDelta(node);
        case 'list': {
            const list = node;
            return joinDeltaLines(list.children.map((item, index) => {
                const order = (list.start ?? 1) + index;
                const prefix = '  '.repeat(depth) + (list.ordered ? `${order}. ` : '- ');
                return flattenListItemToDelta(item, deltaConverter, prefix, depth);
            }));
        }
        case 'blockquote':
            return flattenBlockquoteToDelta(node, deltaConverter);
        default:
            return 'children' in node
                ? joinDeltaLines(node.children.map(child => flattenMarkdownBlockToDelta(child, deltaConverter, depth)))
                : [];
    }
};
const flattenBlockquoteToDelta = (node, deltaConverter) => joinDeltaLines(node.children.map(child => flattenMarkdownBlockToDelta(child, deltaConverter)));
const getSnapshotTextDelta = (node) => {
    const text = (node.props.text ?? { delta: [] });
    return text.delta;
};
const flattenSnapshotBlockToDelta = (node, depth = 0) => {
    if (node.flavour === 'affine:list') {
        const type = node.props.type;
        const order = node.props.order ?? 1;
        const prefix = '  '.repeat(depth) + (type === 'numbered' ? `${order}. ` : '- ');
        return joinDeltaLines([
            [{ insert: prefix }, ...getSnapshotTextDelta(node)],
            ...node.children.map(child => flattenSnapshotBlockToDelta(child, depth + 1)),
        ]);
    }
    return joinDeltaLines([
        getSnapshotTextDelta(node),
        ...node.children.map(child => flattenSnapshotBlockToDelta(child, depth)),
    ]);
};
const flattenQuoteSnapshotToDelta = (text, children) => joinDeltaLines([
    text,
    ...children.map(child => flattenSnapshotBlockToDelta(child)),
]);
export const paragraphBlockMarkdownAdapterMatcher = {
    flavour: ParagraphBlockSchema.model.flavour,
    toMatch: o => isParagraphMDASTType(o.node) && !isCalloutNode(o.node),
    fromMatch: o => o.node.flavour === ParagraphBlockSchema.model.flavour,
    toBlockSnapshot: {
        enter: (o, context) => {
            const { walkerContext, deltaConverter } = context;
            switch (o.node.type) {
                case 'paragraph': {
                    walkerContext.setGlobalContext(IN_PARAGRAPH_NODE_CONTEXT_KEY, true);
                    walkerContext
                        .openNode({
                        type: 'block',
                        id: nanoid(),
                        flavour: 'affine:paragraph',
                        props: {
                            type: 'text',
                            text: {
                                '$blocksuite:internal:text$': true,
                                delta: deltaConverter.astToDelta(o.node),
                            },
                        },
                        children: [],
                    }, 'children')
                        .closeNode();
                    break;
                }
                case 'heading': {
                    const isCollapsed = !!o.node.data?.collapsed;
                    walkerContext
                        .openNode({
                        type: 'block',
                        id: nanoid(),
                        flavour: 'affine:paragraph',
                        props: {
                            type: `h${o.node.depth}`,
                            collapsed: isCollapsed,
                            text: {
                                '$blocksuite:internal:text$': true,
                                delta: deltaConverter.astToDelta(o.node),
                            },
                        },
                        children: [],
                    }, 'children')
                        .closeNode();
                    break;
                }
                case 'blockquote': {
                    if (isCalloutNode(o.node)) {
                        return;
                    }
                    walkerContext
                        .openNode({
                        type: 'block',
                        id: nanoid(),
                        flavour: 'affine:paragraph',
                        props: {
                            type: 'quote',
                            text: {
                                '$blocksuite:internal:text$': true,
                                delta: flattenBlockquoteToDelta(o.node, deltaConverter),
                            },
                        },
                        children: [],
                    }, 'children')
                        .closeNode();
                    walkerContext.skipAllChildren();
                    break;
                }
            }
        },
        leave: (o, context) => {
            if (o.node.type === 'paragraph') {
                const { walkerContext } = context;
                walkerContext.setGlobalContext(IN_PARAGRAPH_NODE_CONTEXT_KEY, false);
            }
        },
    },
    fromBlockSnapshot: {
        enter: (o, context) => {
            const { walkerContext, deltaConverter } = context;
            const paragraphDepth = (walkerContext.getGlobalContext('affine:paragraph:depth') ?? 0);
            const text = (o.node.props.text ?? { delta: [] });
            switch (o.node.props.type) {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6': {
                    walkerContext
                        .openNode({
                        type: 'heading',
                        depth: parseInt(o.node.props.type[1]),
                        children: deltaConverter.deltaToAST(text.delta, paragraphDepth),
                    }, 'children')
                        .closeNode();
                    break;
                }
                case 'text': {
                    walkerContext
                        .openNode({
                        type: 'paragraph',
                        children: deltaConverter.deltaToAST(text.delta, paragraphDepth),
                    }, 'children')
                        .closeNode();
                    break;
                }
                case 'quote': {
                    const quoteDelta = flattenQuoteSnapshotToDelta(text.delta, o.node.children);
                    walkerContext
                        .openNode({
                        type: 'blockquote',
                        children: [],
                    }, 'children')
                        .openNode({
                        type: 'paragraph',
                        children: deltaConverter.deltaToAST(quoteDelta),
                    }, 'children')
                        .closeNode()
                        .closeNode();
                    walkerContext.skipAllChildren();
                    break;
                }
            }
            walkerContext.setGlobalContext('affine:paragraph:depth', paragraphDepth + 1);
        },
        leave: (_, context) => {
            const { walkerContext } = context;
            walkerContext.setGlobalContext('affine:paragraph:depth', walkerContext.getGlobalContext('affine:paragraph:depth') -
                1);
        },
    },
};
export const ParagraphBlockMarkdownAdapterExtension = BlockMarkdownAdapterExtension(paragraphBlockMarkdownAdapterMatcher);
