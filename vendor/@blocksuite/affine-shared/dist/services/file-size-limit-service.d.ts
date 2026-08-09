import { type Container } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
export interface IFileSizeLimitService {
    maxFileSize: number;
    onOverFileSize?: () => void;
}
export declare const FileSizeLimitProvider: import("@blocksuite/global/di").ServiceIdentifier<IFileSizeLimitService> & (<U extends IFileSizeLimitService = IFileSizeLimitService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class FileSizeLimitService extends Extension implements IFileSizeLimitService {
    maxFileSize: number;
    static setup(di: Container): void;
}
//# sourceMappingURL=file-size-limit-service.d.ts.map