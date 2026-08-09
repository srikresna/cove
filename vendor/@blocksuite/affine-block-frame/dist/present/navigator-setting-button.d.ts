import type { BlockComponent } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EdgelessNavigatorSettingButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessNavigatorSettingButton extends EdgelessNavigatorSettingButton_base {
    static styles: import("lit").CSSResult;
    private _navigatorSettingPopper?;
    private readonly _onBlackBackgroundChange;
    private _tryRestoreSettings;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _navigatorSettingButton;
    private accessor _navigatorSettingMenu;
    accessor blackBackground: boolean;
    accessor edgeless: BlockComponent;
    accessor hideToolbar: boolean;
    accessor includeFrameOrder: boolean;
    accessor onHideToolbarChange: undefined | ((hideToolbar: boolean) => void);
    accessor popperShow: boolean;
    accessor setPopperShow: (show: boolean) => void;
}
export {};
//# sourceMappingURL=navigator-setting-button.d.ts.map