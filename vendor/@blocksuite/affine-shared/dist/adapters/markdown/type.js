export const isMarkdownAST = (node) => !Array.isArray(node) &&
    'type' in node &&
    node.type !== undefined;
export const isFootnoteDefinitionNode = (node) => node.type === 'footnoteDefinition';
export const getFootnoteDefinitionText = (node) => {
    const childNode = node.children[0];
    if (childNode.type !== 'paragraph')
        return '';
    const paragraph = childNode.children[0];
    if (paragraph.type !== 'text')
        return '';
    return paragraph.value;
};
export const isCalloutNode = (node) => {
    return node.type === 'blockquote' && !!node.data?.isCallout;
};
export const getCalloutEmoji = (node) => {
    return node.data?.calloutEmoji ?? '';
};
export const FOOTNOTE_DEFINITION_PREFIX = 'footnoteDefinition:';
export const IN_PARAGRAPH_NODE_CONTEXT_KEY = 'mdast:paragraph';
