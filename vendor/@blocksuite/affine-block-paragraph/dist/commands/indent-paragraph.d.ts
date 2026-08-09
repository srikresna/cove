import type { IndentContext } from '@blocksuite/affine-shared/types';
import { type Command } from '@blocksuite/std';
export declare const canIndentParagraphCommand: Command<Partial<Omit<IndentContext, 'flavour' | 'type'>>, {
    indentContext: IndentContext;
}>;
export declare const indentParagraphCommand: Command<{
    indentContext: IndentContext;
}>;
//# sourceMappingURL=indent-paragraph.d.ts.map