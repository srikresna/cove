import type { ExtensionType } from '@blocksuite/store';
import type { AffineUserInfo } from './types';
export interface WriterInfoService {
    getWriterInfo(): AffineUserInfo | null;
}
export declare const WriterInfoProvider: import("@blocksuite/global/di").ServiceIdentifier<WriterInfoService> & (<U extends WriterInfoService = WriterInfoService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function WriterInfoServiceExtension(service: WriterInfoService): ExtensionType;
//# sourceMappingURL=writer-info-service.d.ts.map