import { StoreExtension } from '@blocksuite/store';
/**
 * The service is used to add following info to the block.
 * - createdAt: The time when the block is created.
 * - createdBy: The user who created the block.
 * - updatedAt: The time when the block is updated.
 * - updatedBy: The user who updated the block.
 */
export declare class BlockMetaService extends StoreExtension {
    static key: string;
    get isBlockMetaEnabled(): boolean;
    loaded(): void;
    private readonly _onBlockCreated;
    private readonly _onBlockUpdated;
    private readonly _getWriterInfo;
}
//# sourceMappingURL=block-meta-service.d.ts.map