import { type EmbedLoomBlockProps } from './loom-model.js';
export declare const EmbedLoomBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedLoomBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedLoomBlockProps>>) | undefined;
};
export declare const EmbedLoomBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=loom-schema.d.ts.map