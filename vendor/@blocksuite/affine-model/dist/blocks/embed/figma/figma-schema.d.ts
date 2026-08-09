import { type EmbedFigmaBlockProps } from './figma-model.js';
export declare const EmbedFigmaBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedFigmaBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedFigmaBlockProps>>) | undefined;
};
export declare const EmbedFigmaBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=figma-schema.d.ts.map