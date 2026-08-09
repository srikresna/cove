import type { ReferenceParams } from '@blocksuite/affine-model';
import type { ExtensionType } from '@blocksuite/store';
export interface ParseDocUrlService {
    parseDocUrl: (url: string) => ({
        docId: string;
    } & ReferenceParams) | undefined;
}
export declare const ParseDocUrlProvider: import("@blocksuite/global/di").ServiceIdentifier<ParseDocUrlService> & (<U extends ParseDocUrlService = ParseDocUrlService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function ParseDocUrlExtension(parseDocUrlService: ParseDocUrlService): ExtensionType;
//# sourceMappingURL=parse-url-service.d.ts.map