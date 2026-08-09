import { type EmbedGithubBlockProps } from './github-model.js';
export declare const EmbedGithubBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedGithubBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedGithubBlockProps>>) | undefined;
};
export declare const EmbedGithubBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=github-schema.d.ts.map