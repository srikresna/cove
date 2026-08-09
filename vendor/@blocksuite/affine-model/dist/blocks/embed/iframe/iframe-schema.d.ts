export declare const EmbedIframeBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("./iframe-model").EmbedIframeBlockProps>;
        flavour: "affine:embed-iframe";
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("./iframe-model").EmbedIframeBlockProps>) | undefined;
};
export declare const EmbedIframeBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=iframe-schema.d.ts.map