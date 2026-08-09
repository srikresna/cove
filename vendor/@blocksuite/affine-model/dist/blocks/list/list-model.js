import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export const ListBlockSchema = defineBlockSchema({
    flavour: 'affine:list',
    props: internal => ({
        type: 'bulleted',
        text: internal.Text(),
        textAlign: undefined,
        checked: false,
        collapsed: false,
        // number type only for numbered list
        order: null,
        comments: undefined,
        'meta:createdAt': undefined,
        'meta:createdBy': undefined,
        'meta:updatedAt': undefined,
        'meta:updatedBy': undefined,
    }),
    metadata: {
        version: 1,
        role: 'content',
        parent: [
            'affine:note',
            'affine:database',
            'affine:list',
            'affine:paragraph',
            'affine:edgeless-text',
            'affine:callout',
        ],
    },
    toModel: () => new ListBlockModel(),
});
export const ListBlockSchemaExtension = BlockSchemaExtension(ListBlockSchema);
export class ListBlockModel extends BlockModel {
}
