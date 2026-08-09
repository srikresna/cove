import type { Blockquote, FootnoteDefinition, Root, RootContentMap } from 'mdast';
export type Markdown = string;
type MdastUnionType<K extends keyof RootContentMap, V extends RootContentMap[K]> = V;
export type MarkdownAST = MdastUnionType<keyof RootContentMap, RootContentMap[keyof RootContentMap]> | Root;
export declare const isMarkdownAST: (node: unknown) => node is MarkdownAST;
export declare const isFootnoteDefinitionNode: (node: MarkdownAST) => node is FootnoteDefinition;
export declare const getFootnoteDefinitionText: (node: FootnoteDefinition) => string;
export declare const isCalloutNode: (node: MarkdownAST) => node is Blockquote;
export declare const getCalloutEmoji: (node: Blockquote) => string;
export declare const FOOTNOTE_DEFINITION_PREFIX = "footnoteDefinition:";
export declare const IN_PARAGRAPH_NODE_CONTEXT_KEY = "mdast:paragraph";
export {};
//# sourceMappingURL=type.d.ts.map