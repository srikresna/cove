import { AttachmentBlockComponent } from './attachment-block.js';
declare const AttachmentEdgelessBlockComponent_base: typeof AttachmentBlockComponent & (new (...args: any[]) => import("@blocksuite/std").GfxBlockComponent);
export declare class AttachmentEdgelessBlockComponent extends AttachmentEdgelessBlockComponent_base {
    blockDraggable: boolean;
    get slots(): {
        readonlyUpdated: import("rxjs").Subject<boolean>;
        navigatorSettingUpdated: import("rxjs").Subject<{
            hideToolbar?: boolean;
            blackBackground?: boolean;
            fillScreen?: boolean;
        }>;
        navigatorFrameChanged: import("rxjs").Subject<import("@blocksuite/affine-model").FrameBlockModel>;
        fullScreenToggled: import("rxjs").Subject<void>;
        elementResizeStart: import("rxjs").Subject<void>;
        elementResizeEnd: import("rxjs").Subject<void>;
        toggleNoteSlicer: import("rxjs").Subject<void>;
        toolbarLocked: import("rxjs").Subject<boolean>;
    };
    onClick(_: MouseEvent): void;
    renderGfxBlock(): unknown;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-attachment': AttachmentEdgelessBlockComponent;
    }
}
export declare const AttachmentBlockInteraction: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=attachment-edgeless-block.d.ts.map