import type { Command } from '@blocksuite/std';
/**
 * Re-associate bindings for block that have been converted.
 *
 * @param oldId - the old block id
 * @param newId - the new block id
 */
export declare const reassociateConnectorsCommand: Command<{
    oldId: string;
    newId: string;
}>;
//# sourceMappingURL=reassociate-connectors.d.ts.map