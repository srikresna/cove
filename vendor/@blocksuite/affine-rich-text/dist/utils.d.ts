import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import type { BlockStdScope } from '@blocksuite/std';
import type { InlineEditor } from '@blocksuite/std/inline';
import type { BlockModel } from '@blocksuite/store';
export declare function insertContent(std: BlockStdScope, model: BlockModel, text: string, attributes?: AffineTextAttributes): void;
export declare function clearMarksOnDiscontinuousInput(inlineEditor: InlineEditor): void;
export declare function getPrefixText(inlineEditor: InlineEditor): string;
//# sourceMappingURL=utils.d.ts.map