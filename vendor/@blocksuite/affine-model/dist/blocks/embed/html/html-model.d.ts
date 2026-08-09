export declare const EmbedHtmlStyles: ["html"];
export type EmbedHtmlBlockProps = {
    style: (typeof EmbedHtmlStyles)[number];
    caption: string | null;
    html?: string;
    design?: string;
};
declare const EmbedHtmlModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<import("../../../index.js").EmbedProps<EmbedHtmlBlockProps>>;
};
export declare class EmbedHtmlModel extends EmbedHtmlModel_base {
}
export {};
//# sourceMappingURL=html-model.d.ts.map