import type { FrameBlockModel } from '@blocksuite/affine-model';
import type { ExtensionType } from '@blocksuite/store';
import { Subject } from 'rxjs';
export declare const EdgelessLegacySlotIdentifier: import("@blocksuite/global/di").ServiceIdentifier<{
    readonlyUpdated: Subject<boolean>;
    navigatorSettingUpdated: Subject<{
        hideToolbar?: boolean;
        blackBackground?: boolean;
        fillScreen?: boolean;
    }>;
    navigatorFrameChanged: Subject<FrameBlockModel>;
    fullScreenToggled: Subject<void>;
    elementResizeStart: Subject<void>;
    elementResizeEnd: Subject<void>;
    toggleNoteSlicer: Subject<void>;
    toolbarLocked: Subject<boolean>;
}> & (<U extends {
    readonlyUpdated: Subject<boolean>;
    navigatorSettingUpdated: Subject<{
        hideToolbar?: boolean;
        blackBackground?: boolean;
        fillScreen?: boolean;
    }>;
    navigatorFrameChanged: Subject<FrameBlockModel>;
    fullScreenToggled: Subject<void>;
    elementResizeStart: Subject<void>;
    elementResizeEnd: Subject<void>;
    toggleNoteSlicer: Subject<void>;
    toolbarLocked: Subject<boolean>;
} = {
    readonlyUpdated: Subject<boolean>;
    navigatorSettingUpdated: Subject<{
        hideToolbar?: boolean;
        blackBackground?: boolean;
        fillScreen?: boolean;
    }>;
    navigatorFrameChanged: Subject<FrameBlockModel>;
    fullScreenToggled: Subject<void>;
    elementResizeStart: Subject<void>;
    elementResizeEnd: Subject<void>;
    toggleNoteSlicer: Subject<void>;
    toolbarLocked: Subject<boolean>;
}>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const EdgelessLegacySlotExtension: ExtensionType;
//# sourceMappingURL=legacy-slot-extension.d.ts.map