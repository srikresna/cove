import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export class TableBlockModel extends BlockModel {
}
export const TableModelFlavour = 'affine:table';
export const TableBlockSchema = defineBlockSchema({
    flavour: TableModelFlavour,
    props: () => ({
        rows: {},
        columns: {},
        cells: {},
        comments: undefined,
        textAlign: undefined,
        'meta:createdAt': undefined,
        'meta:createdBy': undefined,
        'meta:updatedAt': undefined,
        'meta:updatedBy': undefined,
    }),
    metadata: {
        isFlatData: true,
        role: 'content',
        version: 1,
        parent: ['affine:note'],
        children: [],
    },
    toModel: () => new TableBlockModel(),
});
export const TableBlockSchemaExtension = BlockSchemaExtension(TableBlockSchema);
