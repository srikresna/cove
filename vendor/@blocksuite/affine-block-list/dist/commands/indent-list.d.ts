import type { IndentContext } from '@blocksuite/affine-shared/types';
import { type Command } from '@blocksuite/std';
export declare const canIndentListCommand: Command<Partial<Omit<IndentContext, 'type' | 'flavour'>>, {
    indentContext: IndentContext;
}>;
export declare const indentListCommand: Command<{
    indentContext: IndentContext;
}>;
//# sourceMappingURL=indent-list.d.ts.map