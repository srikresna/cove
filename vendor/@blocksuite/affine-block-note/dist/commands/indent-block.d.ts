import type { Command } from '@blocksuite/std';
/**
 * @example
 * before indent:
 * - aaa
 *   - bbb
 * - ccc|
 *   - ddd
 *   - eee
 *
 * after indent:
 * - aaa
 *   - bbb
 *   - ccc|
 *     - ddd
 *     - eee
 */
export declare const indentBlock: Command<{
    blockId?: string;
    stopCapture?: boolean;
}>;
//# sourceMappingURL=indent-block.d.ts.map