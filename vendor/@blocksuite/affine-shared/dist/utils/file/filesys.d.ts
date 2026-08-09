interface OpenFilePickerOptions {
    types?: {
        description?: string | undefined;
        accept: Record<string, string | string[]>;
    }[] | undefined;
    excludeAcceptAllOption?: boolean | undefined;
    multiple?: boolean | undefined;
}
export type NativeImageFilesPicker = () => Promise<File[] | null>;
declare const NATIVE_IMAGE_FILES_PICKER_KEY: "__AFFINE_NATIVE_IMAGE_FILES_PICKER__";
declare global {
    interface Window {
        [NATIVE_IMAGE_FILES_PICKER_KEY]?: NativeImageFilesPicker;
        showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
        showDirectoryPicker?: (options?: {
            id?: string;
            mode?: 'read' | 'readwrite';
            startIn?: FileSystemHandle | string;
        }) => Promise<FileSystemDirectoryHandle>;
    }
}
export declare function registerNativeImageFilesPicker(picker: NativeImageFilesPicker | null): void;
interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
}
interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
}
/**
 * See https://web.dev/patterns/files/open-one-or-multiple-files/
 */
type AcceptTypes = 'Any' | 'Images' | 'Videos' | 'Audios' | 'Markdown' | 'Html' | 'Zip' | 'Docx' | 'OneNote' | 'MindMap';
type OpenFileOptions = {
    fileSystemAccess?: boolean;
    snapshot?: boolean;
};
export declare function snapshotFile(file: File, relativePath?: string): Promise<File>;
export declare function snapshotFiles(files: File[]): Promise<File[]>;
export declare function openFilesWith(acceptType?: AcceptTypes, multiple?: boolean, options?: OpenFileOptions): Promise<File[] | null>;
export declare function openDirectory(options?: OpenFileOptions): Promise<File[] | null>;
export declare function openSingleFileWith(acceptType?: AcceptTypes): Promise<File | null>;
export declare function getImageFilesFromLocal(): Promise<File[]>;
export declare function downloadBlob(blob: Blob, name: string): void;
/**
 * Because the image block and attachment block have different props.
 * We need to save some data temporarily when converting between them to ensure no data is lost.
 *
 * For example, before converting from an image block to an attachment block,
 * we need to save the image's width and height.
 *
 * Similarly, when converting from an attachment block to an image block,
 * we need to save the attachment's name.
 *
 * See also https://github.com/toeverything/blocksuite/pull/4583#pullrequestreview-1610662677
 *
 * @internal
 */
export declare function withTempBlobData(): {
    saveAttachmentData: (sourceId: string, data: {
        name: string;
    }) => void;
    getAttachmentData: (blockId: string) => {
        name: string;
    } | undefined;
    saveImageData: (sourceId: string, data: {
        width: number | undefined;
        height: number | undefined;
    }) => void;
    getImageData: (blockId: string) => {
        width: number | undefined;
        height: number | undefined;
    } | undefined;
};
export {};
//# sourceMappingURL=filesys.d.ts.map