import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export const ParagraphBlockSchema = defineBlockSchema({
    flavour: 'affine:paragraph',
    props: (internal) => ({
        type: 'text',
        text: internal.Text(),
        textAlign: undefined,
        collapsed: false,
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
            'affine:paragraph',
            'affine:list',
            'affine:edgeless-text',
            'affine:callout',
            'affine:transcription',
        ],
    },
    toModel: () => new ParagraphBlockModel(),
});
export const ParagraphBlockSchemaExtension = BlockSchemaExtension(ParagraphBlockSchema);
export class ParagraphBlockModel extends BlockModel {
    isEmpty() {
        return this.props.text$.value.length === 0 && this.children.length === 0;
    }
}
