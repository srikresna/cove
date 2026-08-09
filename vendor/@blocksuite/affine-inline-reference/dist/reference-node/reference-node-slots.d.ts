import type { ReferenceInfo } from '@blocksuite/affine-model';
import type { OpenDocMode } from '@blocksuite/affine-shared/services';
import type { EditorHost } from '@blocksuite/std';
import type { ExtensionType } from '@blocksuite/store';
import { Subject } from 'rxjs';
export type DocLinkClickedEvent = ReferenceInfo & {
    openMode?: OpenDocMode;
    event?: MouseEvent;
    host: EditorHost;
};
export type RefNodeSlots = {
    docLinkClicked: Subject<DocLinkClickedEvent>;
};
export declare const RefNodeSlotsProvider: import("@blocksuite/global/di").ServiceIdentifier<RefNodeSlots> & (<U extends RefNodeSlots = RefNodeSlots>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const RefNodeSlotsExtension: ExtensionType;
//# sourceMappingURL=reference-node-slots.d.ts.map