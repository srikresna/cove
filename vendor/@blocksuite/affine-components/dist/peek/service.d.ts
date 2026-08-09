import type { ExtensionType } from '@blocksuite/store';
import type { PeekViewService } from './type.js';
export declare const PeekViewProvider: import("@blocksuite/global/di").ServiceIdentifier<PeekViewService> & (<U extends PeekViewService = PeekViewService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function PeekViewExtension(service: PeekViewService): ExtensionType;
//# sourceMappingURL=service.d.ts.map