import { ShadowlessElement } from '@blocksuite/std';
export declare const AFFINE_OUTLINE_PANEL_HEADER = "affine-outline-panel-header";
declare const OutlinePanelHeader_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlinePanelHeader extends OutlinePanelHeader_base {
    private _notePreviewSettingMenuPopper;
    private readonly _settingPopperShow$;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _notePreviewSettingMenu;
    private accessor _noteSettingButton;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_PANEL_HEADER]: OutlinePanelHeader;
    }
}
export {};
//# sourceMappingURL=outline-panel-header.d.ts.map