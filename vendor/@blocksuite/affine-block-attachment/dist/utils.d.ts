import { type AttachmentBlockModel } from '@blocksuite/affine-model';
import { type IVec } from '@blocksuite/global/gfx';
import type { BlockStdScope } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import type { AttachmentBlockComponent } from './attachment-block';
export declare function getAttachmentBlob(model: AttachmentBlockModel): Promise<Blob | null>;
/**
 * Since the size of the attachment may be very large,
 * the download process may take a long time!
 */
export declare function downloadAttachmentBlob(block: AttachmentBlockComponent): void;
export declare function refreshData(block: AttachmentBlockComponent): Promise<void>;
export declare function getFileType(file: File): Promise<string>;
/**
 * Add a new attachment block before / after the specified block.
 */
export declare function addSiblingAttachmentBlocks(std: BlockStdScope, files: File[], targetModel: BlockModel, placement?: 'before' | 'after', embed?: boolean): Promise<string[]>;
export declare function addAttachments(std: BlockStdScope, files: File[], point?: IVec, shouldTransformPoint?: boolean): Promise<string[]>;
//# sourceMappingURL=utils.d.ts.map