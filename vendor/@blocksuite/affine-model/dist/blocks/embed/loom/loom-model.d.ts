export type EmbedLoomBlockUrlData = {
    videoId: string | null;
    image: string | null;
    title: string | null;
    description: string | null;
};
export declare const EmbedLoomStyles: ["video"];
export type EmbedLoomBlockProps = {
    style: (typeof EmbedLoomStyles)[number];
    url: string;
    caption: string | null;
} & EmbedLoomBlockUrlData;
declare const EmbedLoomModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<import("../../../index.js").EmbedProps<EmbedLoomBlockProps>>;
};
export declare class EmbedLoomModel extends EmbedLoomModel_base {
}
export {};
//# sourceMappingURL=loom-model.d.ts.map