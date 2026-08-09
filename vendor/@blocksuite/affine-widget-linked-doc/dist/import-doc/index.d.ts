import type { ExtensionType, Schema, Workspace } from '@blocksuite/store';
import { ImportDoc, type OnFailHandler, type OnSuccessHandler } from './import-doc.js';
export declare function showImportModal({ schema, collection, extensions, onSuccess, onFail, container, abortController, }: {
    schema: Schema;
    collection: Workspace;
    extensions: ExtensionType[];
    onSuccess?: OnSuccessHandler;
    onFail?: OnFailHandler;
    multiple?: boolean;
    container?: HTMLElement;
    abortController?: AbortController;
}): ImportDoc;
//# sourceMappingURL=index.d.ts.map