import type { AffineTextStyleAttributes } from '@blocksuite/affine-shared/types';
import type { Command, TextSelection } from '@blocksuite/std';
export declare const formatTextCommand: Command<{
    currentTextSelection?: TextSelection;
    textSelection?: TextSelection;
    styles: AffineTextStyleAttributes;
    mode?: 'replace' | 'merge';
}>;
//# sourceMappingURL=format-text.d.ts.map