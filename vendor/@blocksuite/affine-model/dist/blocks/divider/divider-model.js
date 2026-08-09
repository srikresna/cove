import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export const DividerBlockSchema = defineBlockSchema({
    flavour: 'affine:divider',
    metadata: {
        version: 1,
        role: 'content',
        children: [],
    },
    toModel: () => new DividerBlockModel(),
});
export class DividerBlockModel extends BlockModel {
}
export const DividerBlockSchemaExtension = BlockSchemaExtension(DividerBlockSchema);
