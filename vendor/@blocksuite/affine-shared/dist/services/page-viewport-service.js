import { createIdentifier } from '@blocksuite/global/di';
import { Subject } from 'rxjs';
export const PageViewportService = createIdentifier('PageViewportService');
export const PageViewportServiceExtension = {
    setup: di => {
        di.addImpl(PageViewportService, () => new Subject());
    },
};
