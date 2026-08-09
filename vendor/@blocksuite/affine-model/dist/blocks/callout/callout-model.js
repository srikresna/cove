import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export const CalloutBlockSchema = defineBlockSchema({
    flavour: 'affine:callout',
    props: (internal) => ({
        icon: { type: 'emoji', unicode: '💡' },
        text: internal.Text(),
        backgroundColorName: 'grey',
        'meta:createdAt': undefined,
        'meta:updatedAt': undefined,
        'meta:createdBy': undefined,
        'meta:updatedBy': undefined,
    }),
    metadata: {
        version: 1,
        role: 'hub',
        parent: [
            'affine:note',
            'affine:database',
            'affine:paragraph',
            'affine:list',
            'affine:edgeless-text',
            'affine:transcription',
        ],
        children: ['affine:paragraph', 'affine:list'],
    },
    toModel: () => new CalloutBlockModel(),
});
export class CalloutBlockModel extends BlockModel {
}
export const CalloutBlockSchemaExtension = BlockSchemaExtension(CalloutBlockSchema);
