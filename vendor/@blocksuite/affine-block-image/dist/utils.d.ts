import { Bound, type IVec } from '@blocksuite/global/gfx';
import { type BlockStdScope } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import type { ImageBlockComponent } from './image-block';
import type { ImageEdgelessBlockComponent } from './image-edgeless-block';
export declare function refreshData(block: ImageBlockComponent | ImageEdgelessBlockComponent): Promise<void>;
export declare function downloadImageBlob(block: ImageBlockComponent | ImageEdgelessBlockComponent): Promise<void>;
export declare function resetImageSize(block: ImageBlockComponent | ImageEdgelessBlockComponent): Promise<void>;
export declare function copyImageBlob(block: ImageBlockComponent | ImageEdgelessBlockComponent): Promise<void>;
/**
 * Turn the image block into a attachment block.
 */
export declare function turnImageIntoCardView(block: ImageBlockComponent | ImageEdgelessBlockComponent): Promise<void>;
export declare function shouldResizeImage(node: Node, target: EventTarget | null): boolean;
export declare function addSiblingImageBlocks(std: BlockStdScope, files: File[], targetModel: BlockModel, placement?: 'after' | 'before'): Promise<string[]>;
export declare function addImageBlocks(std: BlockStdScope, files: File[], parent?: BlockModel | string | null, parentIndex?: number): Promise<string[]>;
export declare function addImages(std: BlockStdScope, files: File[], options: {
    point?: IVec;
    maxWidth?: number;
    shouldTransformPoint?: boolean;
}): Promise<string[]>;
export declare function calcBoundByOrigin(point: IVec, inTopLeft?: boolean, width?: number, height?: number): Bound;
export declare function duplicate(block: ImageBlockComponent): void;
//# sourceMappingURL=utils.d.ts.map