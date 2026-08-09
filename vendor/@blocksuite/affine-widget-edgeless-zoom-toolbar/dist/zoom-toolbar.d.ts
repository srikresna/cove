import type { BlockStdScope } from '@blocksuite/std';
import { LitElement, nothing } from 'lit';
declare const EdgelessZoomToolbar_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessZoomToolbar extends EdgelessZoomToolbar_base {
    static styles: import("lit").CSSResult;
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
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get edgelessTool(): import("@blocksuite/std/gfx").ToolOptionWithType;
    get locked(): boolean;
    get viewport(): import("@blocksuite/std/gfx").Viewport;
    setZoomByStep: (step: number) => void;
    get zoom(): number;
    private _isVerticalBar;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    accessor layout: 'horizontal' | 'vertical';
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=zoom-toolbar.d.ts.map