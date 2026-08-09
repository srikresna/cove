import { PageKeyboardManager } from '../keyboard/keyboard-manager.js';
import type { EdgelessRootBlockComponent } from './edgeless-root-block.js';
export declare class EdgelessPageKeyboardManager extends PageKeyboardManager {
    rootComponent: EdgelessRootBlockComponent;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
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
    get std(): import("@blocksuite/std").BlockStdScope;
    constructor(rootComponent: EdgelessRootBlockComponent);
    private _bindToggleHand;
    private _delete;
    private _move;
    private _setEdgelessTool;
    private _space;
}
//# sourceMappingURL=edgeless-keyboard.d.ts.map