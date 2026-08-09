export type EmbedFigmaBlockUrlData = {
    title: string | null;
    description: string | null;
};
export declare const EmbedFigmaStyles: ["figma"];
export type EmbedFigmaBlockProps = {
    style: (typeof EmbedFigmaStyles)[number];
    url: string;
    caption: string | null;
} & EmbedFigmaBlockUrlData;
declare const EmbedFigmaModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<import("../../../index.js").EmbedProps<EmbedFigmaBlockProps>>;
};
export declare class EmbedFigmaModel extends EmbedFigmaModel_base {
}
export {};
//# sourceMappingURL=figma-model.d.ts.map