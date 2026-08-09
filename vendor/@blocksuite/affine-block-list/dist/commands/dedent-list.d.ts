import type { IndentContext } from '@blocksuite/affine-shared/types';
import { type Command } from '@blocksuite/std';
export declare const canDedentListCommand: Command<Partial<Omit<IndentContext, 'flavour' | 'type'>>, {
    indentContext: IndentContext;
}>;
export declare const dedentListCommand: Command<{
    indentContext: IndentContext;
}>;
//# sourceMappingURL=dedent-list.d.ts.map