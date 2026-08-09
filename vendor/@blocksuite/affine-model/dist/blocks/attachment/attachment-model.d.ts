import type { GfxCommonBlockProps, GfxElementGeometry } from '@blocksuite/std/gfx';
import type { BlockMeta } from '../../utils/index.js';
import { AttachmentBlockTransformer } from './attachment-transformer.js';
/**
 * When the attachment is uploading, the `sourceId` is `undefined`.
 * And we can query the upload status by the `isAttachmentLoading` function.
 *
 * Other collaborators will see an error attachment block when the blob has not finished uploading.
 * This issue can be resolve by sync the upload status through the awareness system in the future.
 *
 * When the attachment is uploaded, the `sourceId` is the id of the blob.
 *
 * If there are no `sourceId` and the `isAttachmentLoading` function returns `false`,
 * it means that the attachment is failed to upload.
 */
/**
 * @deprecated
 */
type BackwardCompatibleUndefined = undefined;
export declare const AttachmentBlockStyles: ["cubeThick", "horizontalThin", "pdf", "citation"];
export type AttachmentBlockProps = {
    name: string;
    size: number;
    /**
     * MIME type
     */
    type: string;
    caption?: string;
    sourceId?: string;
    /**
     * Whether to show the attachment as an embed view.
     */
    embed: boolean | BackwardCompatibleUndefined;
    style?: (typeof AttachmentBlockStyles)[number];
    footnoteIdentifier: string | null;
    comments?: Record<string, boolean>;
} & Omit<GfxCommonBlockProps, 'scale'> & BlockMeta;
export declare const defaultAttachmentProps: AttachmentBlockProps;
export declare const AttachmentBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<AttachmentBlockProps>;
        flavour: "affine:attachment";
    } & {
        version: number;
        role: "content";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => AttachmentBlockTransformer) | undefined;
};
export declare const AttachmentBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const AttachmentBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<AttachmentBlockProps>;
};
export declare class AttachmentBlockModel extends AttachmentBlockModel_base implements GfxElementGeometry {
}
export {};
//# sourceMappingURL=attachment-model.d.ts.map