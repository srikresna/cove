import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export class DatabaseBlockModel extends BlockModel {
}
export const DatabaseBlockSchema = defineBlockSchema({
    flavour: 'affine:database',
    props: (internal) => ({
        views: [],
        title: internal.Text(),
        cells: Object.create(null),
        columns: [],
        comments: undefined,
    }),
    metadata: {
        role: 'hub',
        version: 3,
        parent: ['affine:note'],
        children: ['affine:paragraph', 'affine:list'],
    },
    toModel: () => new DatabaseBlockModel(),
});
export const DatabaseBlockSchemaExtension = BlockSchemaExtension(DatabaseBlockSchema);
