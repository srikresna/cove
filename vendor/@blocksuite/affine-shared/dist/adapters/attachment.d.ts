import { type AttachmentBlockProps } from '@blocksuite/affine-model';
import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload } from '@blocksuite/store';
export type Attachment = File[];
type CreateAttachmentBlockSnapshotOptions = {
    id?: string;
    props: Partial<AttachmentBlockProps> & Pick<AttachmentBlockProps, 'name'>;
};
export declare function createAttachmentBlockSnapshot({ id, props, }: CreateAttachmentBlockSnapshotOptions): BlockSnapshot;
type AttachmentToSliceSnapshotPayload = {
    file: Attachment;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
export declare class AttachmentAdapter extends BaseAdapter<Attachment> {
    fromBlockSnapshot(_payload: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<Attachment>>;
    fromDocSnapshot(_payload: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<Attachment>>;
    fromSliceSnapshot(payload: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<Attachment>>;
    toBlockSnapshot(_payload: ToBlockSnapshotPayload<Attachment>): Promise<BlockSnapshot>;
    toDocSnapshot(_payload: ToDocSnapshotPayload<Attachment>): Promise<DocSnapshot>;
    toSliceSnapshot({ assets, file: files, pageId, workspaceId, }: AttachmentToSliceSnapshotPayload): Promise<SliceSnapshot | null>;
}
export declare const AttachmentAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("./types").AdapterFactory>;
export declare const AttachmentAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=attachment.d.ts.map