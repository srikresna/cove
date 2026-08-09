import type { ExtensionType } from '@blocksuite/store';
import type { Viewport } from '../types';
export interface ViewportElementService {
    get viewportElement(): HTMLElement;
    get viewport(): Viewport;
}
export declare const ViewportElementProvider: import("@blocksuite/global/di").ServiceIdentifier<ViewportElementService> & (<U extends ViewportElementService = ViewportElementService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const ViewportElementExtension: (selector: string) => ExtensionType;
//# sourceMappingURL=viewport-element-service.d.ts.map