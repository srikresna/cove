import { type GfxCommonBlockProps, type GfxElementGeometry } from '@blocksuite/std/gfx';
export declare const EmbedIframeStyles: ["figma"];
export type EmbedIframeBlockProps = {
    url: string;
    iframeUrl?: string;
    width?: number;
    height?: number;
    caption: string | null;
    title: string | null;
    description: string | null;
} & Omit<GfxCommonBlockProps, 'rotate'>;
export declare const defaultEmbedIframeProps: EmbedIframeBlockProps;
declare const EmbedIframeBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<EmbedIframeBlockProps>;
};
export declare class EmbedIframeBlockModel extends EmbedIframeBlockModel_base implements GfxElementGeometry {
}
export {};
//# sourceMappingURL=iframe-model.d.ts.map