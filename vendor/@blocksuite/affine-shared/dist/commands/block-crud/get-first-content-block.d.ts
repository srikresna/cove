import type { Command } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
type Role = 'content' | 'hub';
/**
 * Get the first block with specified roles and flavours in the document
 *
 * @param ctx - Command context
 * @param ctx.root - The root note block model
 * @param ctx.role - The roles to match, can be string or string array. If not provided, default to all supported roles.
 * @param ctx.flavour - The flavours to match, can be string or string array. If not provided, match any flavour.
 * @param next - Next handler function
 * @returns The first block model matched or null
 */
export declare const getFirstBlockCommand: Command<{
    root?: BlockModel;
    role?: Role | Role[];
    flavour?: string | string[];
}, {
    firstBlock: BlockModel | null;
}>;
export {};
//# sourceMappingURL=get-first-content-block.d.ts.map