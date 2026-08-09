import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export const CodeBlockSchema = defineBlockSchema({
    flavour: 'affine:code',
    props: internal => ({
        text: internal.Text(),
        language: null,
        wrap: false,
        caption: '',
        preview: undefined,
        lineNumber: undefined,
        collapsed: undefined,
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
            'affine:paragraph',
            'affine:list',
            'affine:edgeless-text',
        ],
        children: [],
    },
    toModel: () => new CodeBlockModel(),
});
export const CodeBlockSchemaExtension = BlockSchemaExtension(CodeBlockSchema);
export class CodeBlockModel extends BlockModel {
}
