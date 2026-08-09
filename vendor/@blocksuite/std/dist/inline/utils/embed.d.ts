import type { BaseTextAttributes, DeltaInsert } from '@blocksuite/store';
import type { InlineEditor } from '../inline-editor.js';
export declare function isInEmbedElement(node: Node): boolean;
export declare function isInEmbedGap(node: Node): boolean;
export declare function transformDeltasToEmbedDeltas<TextAttributes extends BaseTextAttributes = BaseTextAttributes>(editor: InlineEditor<TextAttributes>, deltas: DeltaInsert<TextAttributes>[]): DeltaInsert<TextAttributes>[];
//# sourceMappingURL=embed.d.ts.map