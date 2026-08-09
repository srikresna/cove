import { EmbedIframeLinkInputBase } from './embed-iframe-link-input-base';
declare const EmbedIframeLinkEditPopup_base: typeof EmbedIframeLinkInputBase;
export declare class EmbedIframeLinkEditPopup extends EmbedIframeLinkEditPopup_base {
    static styles: import("lit").CSSResult;
    protected track(status: 'success' | 'failure'): void;
    render(): import("lit-html").TemplateResult<1>;
    get telemetryService(): import("@blocksuite/affine-shared/services").TelemetryService | null;
    get editorMode(): import("@blocksuite/affine-model").DocMode;
}
export {};
//# sourceMappingURL=embed-iframe-link-edit-popup.d.ts.map