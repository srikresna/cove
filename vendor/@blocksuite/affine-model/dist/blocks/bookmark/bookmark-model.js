import { GfxCompatible } from '@blocksuite/std/gfx';
import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export const BookmarkStyles = [
    'vertical',
    'horizontal',
    'list',
    'cube',
    'citation',
];
const defaultBookmarkProps = {
    style: BookmarkStyles[1],
    url: '',
    caption: null,
    description: null,
    icon: null,
    image: null,
    title: null,
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
export const BookmarkBlockSchema = defineBlockSchema({
    flavour: 'affine:bookmark',
    props: () => defaultBookmarkProps,
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
    },
    toModel: () => new BookmarkBlockModel(),
});
export const BookmarkBlockSchemaExtension = BlockSchemaExtension(BookmarkBlockSchema);
export class BookmarkBlockModel extends GfxCompatible(BlockModel) {
}
