import type { FrameBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { LitElement, type PropertyValues } from 'lit';
import { PresentTool } from '../present-tool';
declare const PresentationToolbar_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class PresentationToolbar extends PresentationToolbar_base {
    static styles: import("lit").CSSResult;
    private _cachedIndex;
    private _timer?;
    type: typeof PresentTool;
    private get _cachedPresentHideToolbar();
    private set _cachedPresentHideToolbar(value);
    private get _frames();
    get dense(): boolean;
    get host(): import("@blocksuite/std").EditorHost;
    get slots(): {
        readonlyUpdated: import("rxjs").Subject<boolean>;
        navigatorSettingUpdated: import("rxjs").Subject<{
            hideToolbar?: boolean;
            blackBackground?: boolean;
            fillScreen?: boolean;
        }>;
        navigatorFrameChanged: import("rxjs").Subject<FrameBlockModel>;
        fullScreenToggled: import("rxjs").Subject<void>;
        elementResizeStart: import("rxjs").Subject<void>;
        elementResizeEnd: import("rxjs").Subject<void>;
        toggleNoteSlicer: import("rxjs").Subject<void>;
        toolbarLocked: import("rxjs").Subject<boolean>;
    };
    constructor(edgeless: BlockComponent);
    private _bindHotKey;
    private _exitPresentation;
    private _moveToCurrentFrame;
    private _nextFrame;
    private _previousFrame;
    /**
     * Toggle fullscreen, but keep edgeless tool to frameNavigator
     * If already fullscreen, exit fullscreen
     * If not fullscreen, enter fullscreen
     */
    private _toggleFullScreen;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    protected updated(changedProperties: PropertyValues): void;
    private accessor _currentFrameIndex;
    private accessor _fullScreenMode;
    private accessor _navigatorMode;
    accessor containerWidth: number;
    accessor frameMenuShow: boolean;
    accessor setFrameMenuShow: (show: boolean) => void;
    accessor setSettingMenuShow: (show: boolean) => void;
    accessor settingMenuShow: boolean;
}
export {};
//# sourceMappingURL=presentation-toolbar.d.ts.map