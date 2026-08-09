import { GfxCompatible } from '@blocksuite/std/gfx';
import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
import { ImageBlockTransformer } from './image-transformer.js';
const defaultImageProps = {
    caption: '',
    sourceId: '',
    width: 0,
    height: 0,
    index: 'a0',
    xywh: '[0,0,0,0]',
    lockedBySelf: false,
    rotate: 0,
    size: -1,
    comments: undefined,
    textAlign: undefined,
    'meta:createdAt': undefined,
    'meta:createdBy': undefined,
    'meta:updatedAt': undefined,
    'meta:updatedBy': undefined,
};
export const ImageBlockSchema = defineBlockSchema({
    flavour: 'affine:image',
    props: () => defaultImageProps,
    metadata: {
        version: 1,
        role: 'content',
    },
    transformer: transformerConfigs => new ImageBlockTransformer(transformerConfigs),
    toModel: () => new ImageBlockModel(),
});
export const ImageBlockSchemaExtension = BlockSchemaExtension(ImageBlockSchema);
export class ImageBlockModel extends GfxCompatible(BlockModel) {
}
