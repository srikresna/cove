import type { EditorHost } from '@blocksuite/std';
import { LitElement, type PropertyValues } from 'lit';
export declare const AFFINE_FRAMES_SETTING_MENU = "affine-frames-setting-menu";
declare const FramesSettingMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class FramesSettingMenu extends FramesSettingMenu_base {
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
    private readonly _onBlackBackgroundChange;
    private readonly _onFillScreenChange;
    private readonly _onHideToolBarChange;
    private get _editPropsStore();
    private _tryRestoreSettings;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    updated(_changedProperties: PropertyValues): void;
    accessor blackBackground: boolean;
    accessor editorHost: EditorHost;
    accessor fillScreen: boolean;
    accessor hideToolbar: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_FRAMES_SETTING_MENU]: FramesSettingMenu;
    }
}
export {};
//# sourceMappingURL=frames-setting-menu.d.ts.map