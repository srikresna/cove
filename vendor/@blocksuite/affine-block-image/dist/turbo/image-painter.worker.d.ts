import type { BlockLayout } from '@blocksuite/affine-gfx-turbo-renderer';
export interface ImageLayout extends BlockLayout {
    type: 'affine:image';
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}
export declare const ImageLayoutPainterExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=image-painter.worker.d.ts.map