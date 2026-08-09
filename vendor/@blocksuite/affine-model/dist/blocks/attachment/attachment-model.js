import { GfxCompatible } from '@blocksuite/std/gfx';
import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
import { AttachmentBlockTransformer } from './attachment-transformer.js';
export const AttachmentBlockStyles = [
    'cubeThick',
    'horizontalThin',
    'pdf',
    'citation',
];
export const defaultAttachmentProps = {
    name: '',
    size: 0,
    type: 'application/octet-stream',
    sourceId: undefined,
    caption: undefined,
    embed: false,
    style: AttachmentBlockStyles[1],
    index: 'a0',
    xywh: '[0,0,0,0]',
    lockedBySelf: false,
    rotate: 0,
    'meta:createdAt': undefined,
    'meta:updatedAt': undefined,
    'meta:createdBy': undefined,
    'meta:updatedBy': undefined,
    footnoteIdentifier: null,
    comments: undefined,
};
export const AttachmentBlockSchema = defineBlockSchema({
    flavour: 'affine:attachment',
    props: () => defaultAttachmentProps,
    metadata: {
        version: 1,
        role: 'content',
        parent: [
            'affine:note',
            'affine:surface',
            'affine:edgeless-text',
            'affine:paragraph',
            'affine:list',
        ],
        children: ['@attachment-viewer'],
    },
    transformer: transformerConfigs => new AttachmentBlockTransformer(transformerConfigs),
    toModel: () => new AttachmentBlockModel(),
});
export const AttachmentBlockSchemaExtension = BlockSchemaExtension(AttachmentBlockSchema);
export class AttachmentBlockModel extends GfxCompatible(BlockModel) {
}
