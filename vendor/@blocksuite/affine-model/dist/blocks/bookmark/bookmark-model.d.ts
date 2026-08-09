import type { GfxCommonBlockProps, GfxElementGeometry } from '@blocksuite/std/gfx';
import type { BlockMeta, LinkPreviewData } from '../../utils/index.js';
export declare const BookmarkStyles: ["vertical", "horizontal", "list", "cube", "citation"];
export type BookmarkBlockProps = {
    style: (typeof BookmarkStyles)[number];
    url: string;
    caption: string | null;
    footnoteIdentifier: string | null;
    comments?: Record<string, boolean>;
} & LinkPreviewData & Omit<GfxCommonBlockProps, 'scale'> & BlockMeta;
export declare const BookmarkBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<BookmarkBlockProps>;
        flavour: "affine:bookmark";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<BookmarkBlockProps>) | undefined;
};
export declare const BookmarkBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const BookmarkBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<BookmarkBlockProps>;
};
export declare class BookmarkBlockModel extends BookmarkBlockModel_base implements GfxElementGeometry {
}
export {};
//# sourceMappingURL=bookmark-model.d.ts.map