import { type GfxCommonBlockProps, type GfxElementGeometry } from '@blocksuite/std/gfx';
export type LatexProps = {
    latex: string;
    comments?: Record<string, boolean>;
} & GfxCommonBlockProps;
export declare const LatexBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<LatexProps>;
        flavour: "affine:latex";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<LatexProps>) | undefined;
};
export declare const LatexBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const LatexBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<LatexProps>;
};
export declare class LatexBlockModel extends LatexBlockModel_base implements GfxElementGeometry {
}
export {};
//# sourceMappingURL=latex-model.d.ts.map