import { type EmbedYoutubeBlockProps } from './youtube-model.js';
export declare const EmbedYoutubeBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedYoutubeBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedYoutubeBlockProps>>) | undefined;
};
export declare const EmbedYoutubeBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=youtube-schema.d.ts.map