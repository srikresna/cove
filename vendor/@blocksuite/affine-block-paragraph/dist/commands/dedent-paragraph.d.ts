import type { IndentContext } from '@blocksuite/affine-shared/types';
import { type Command } from '@blocksuite/std';
export declare const canDedentParagraphCommand: Command<Partial<Omit<IndentContext, 'flavour' | 'type'>>, {
    indentContext: IndentContext;
}>;
export declare const dedentParagraphCommand: Command<{
    indentContext: IndentContext;
}>;
//# sourceMappingURL=dedent-paragraph.d.ts.map