import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload } from '@blocksuite/store';
export type Image = File[];
type ImageToSliceSnapshotPayload = {
    file: Image;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
export declare class ImageAdapter extends BaseAdapter<Image> {
    fromBlockSnapshot(_payload: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<Image>>;
    fromDocSnapshot(_payload: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<Image>>;
    fromSliceSnapshot(payload: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<Image>>;
    toBlockSnapshot(_payload: ToBlockSnapshotPayload<Image>): Promise<BlockSnapshot>;
    toDocSnapshot(_payload: ToDocSnapshotPayload<Image>): Promise<DocSnapshot>;
    toSliceSnapshot({ assets, file: files, pageId, workspaceId, }: ImageToSliceSnapshotPayload): Promise<SliceSnapshot | null>;
}
export declare const ImageAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("./types").AdapterFactory>;
export declare const ImageAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=image.d.ts.map