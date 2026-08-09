import type { BaseTextAttributes, DeltaInsert } from '@blocksuite/store';
import type { TemplateResult } from 'lit';
import type { InlineEditor } from './inline-editor.js';
export type AttributeRenderer<TextAttributes extends BaseTextAttributes = BaseTextAttributes> = (props: {
    editor: InlineEditor<TextAttributes>;
    delta: DeltaInsert<TextAttributes>;
    selected: boolean;
    startOffset: number;
    endOffset: number;
    lineIndex: number;
    children?: TemplateResult<1>;
}) => TemplateResult<1>;
export interface InlineRange {
    index: number;
    length: number;
}
export type DeltaEntry<TextAttributes extends BaseTextAttributes = BaseTextAttributes> = [delta: DeltaInsert<TextAttributes>, range: InlineRange];
export type NativePoint = readonly [node: Node, offset: number];
export type TextPoint = readonly [text: Text, offset: number];
export interface DomPoint {
    text: Text;
    index: number;
}
//# sourceMappingURL=types.d.ts.map