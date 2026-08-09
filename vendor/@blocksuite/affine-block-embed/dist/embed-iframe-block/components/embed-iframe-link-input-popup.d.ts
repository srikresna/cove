import { EmbedIframeLinkInputBase } from './embed-iframe-link-input-base';
type EmbedLinkInputPopupVariant = 'default' | 'mobile';
export type EmbedLinkInputPopupOptions = {
    showCloseButton?: boolean;
    variant?: EmbedLinkInputPopupVariant;
    title?: string;
    description?: string;
    placeholder?: string;
    telemetrySegment?: string;
};
export declare class EmbedIframeLinkInputPopup extends EmbedIframeLinkInputBase {
    static styles: import("lit").CSSResult;
    private readonly _onClose;
    protected track(status: 'success' | 'failure'): void;
    render(): import("lit-html").TemplateResult<1>;
    get telemetryService(): import("@blocksuite/affine-shared/services").TelemetryService | null;
    get editorMode(): import("@blocksuite/affine-model").DocMode;
    accessor options: EmbedLinkInputPopupOptions | undefined;
}
export {};
//# sourceMappingURL=embed-iframe-link-input-popup.d.ts.map