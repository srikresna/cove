import type { GfxCommonBlockProps, GfxElementGeometry } from '@blocksuite/std/gfx';
import type { TextAlign } from '../../consts';
import type { BlockMeta } from '../../utils/types.js';
import { ImageBlockTransformer } from './image-transformer.js';
export type ImageBlockProps = {
    caption?: string;
    sourceId?: string;
    width?: number;
    height?: number;
    rotate: number;
    size?: number;
    comments?: Record<string, boolean>;
    textAlign?: TextAlign;
} & Omit<GfxCommonBlockProps, 'scale'> & BlockMeta;
export declare const ImageBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<ImageBlockProps>;
        flavour: "affine:image";
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => ImageBlockTransformer) | undefined;
};
export declare const ImageBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const ImageBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<ImageBlockProps>;
};
export declare class ImageBlockModel extends ImageBlockModel_base implements GfxElementGeometry {
}
export {};
//# sourceMappingURL=image-model.d.ts.map