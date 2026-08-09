import { createIdentifier } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
export const FileSizeLimitProvider = createIdentifier('FileSizeLimitService');
export class FileSizeLimitService extends Extension {
    constructor() {
        super(...arguments);
        // 2GB
        this.maxFileSize = 2 * 1024 * 1024 * 1024;
    }
    static setup(di) {
        di.addImpl(FileSizeLimitProvider, FileSizeLimitService);
    }
}
