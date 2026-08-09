import { BlockModel } from '@blocksuite/store';
export type SurfaceRefProps = {
    reference: string;
    caption: string;
    refFlavour: string;
    comments?: Record<string, boolean>;
};
export declare const SurfaceRefBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<SurfaceRefProps>;
        flavour: "affine:surface-ref";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<SurfaceRefProps>) | undefined;
};
export declare const SurfaceRefBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class SurfaceRefBlockModel extends BlockModel<SurfaceRefProps> {
}
//# sourceMappingURL=surface-ref-model.d.ts.map