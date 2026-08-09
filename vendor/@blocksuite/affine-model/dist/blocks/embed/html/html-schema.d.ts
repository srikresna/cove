import { type EmbedHtmlBlockProps } from './html-model.js';
export declare const EmbedHtmlBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedHtmlBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedHtmlBlockProps>>) | undefined;
};
export declare const EmbedHtmlBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=html-schema.d.ts.map