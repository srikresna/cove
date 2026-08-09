import type { BlockProps } from '../model';
import type { BlobCRUD } from './type';
type AssetsManagerConfig = {
    blob: BlobCRUD;
};
export declare class AssetsManager {
    readonly uploadingAssetsMap: Map<string, {
        blob: Blob;
        abortController?: AbortController;
        mapInto: (blobId: string) => Partial<BlockProps>;
    }>;
    private readonly _assetsMap;
    private readonly _blob;
    private readonly _names;
    private readonly _pathBlobIdMap;
    constructor(options: AssetsManagerConfig);
    cleanup(): void;
    getAssets(): Map<string, Blob>;
    getPathBlobIdMap(): Map<string, string>;
    isEmpty(): boolean;
    readFromBlob(blobId: string): Promise<void>;
    writeToBlob(blobId: string): Promise<void>;
}
export {};
//# sourceMappingURL=assets.d.ts.map