import type { ReferenceParams } from '@blocksuite/affine-model';
import type { ExtensionType } from '@blocksuite/store';
export interface GenerateDocUrlService {
    generateDocUrl: (docId: string, params?: ReferenceParams) => string | void;
}
export declare const GenerateDocUrlProvider: import("@blocksuite/global/di").ServiceIdentifier<GenerateDocUrlService> & (<U extends GenerateDocUrlService = GenerateDocUrlService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function GenerateDocUrlExtension(generateDocUrlProvider: GenerateDocUrlService): ExtensionType;
//# sourceMappingURL=generate-url-service.d.ts.map