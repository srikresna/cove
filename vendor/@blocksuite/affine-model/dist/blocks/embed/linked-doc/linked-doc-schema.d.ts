import { type EmbedLinkedDocBlockProps } from './linked-doc-model.js';
export declare const EmbedLinkedDocBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedLinkedDocBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedLinkedDocBlockProps>>) | undefined;
};
export declare const EmbedLinkedDocBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=linked-doc-schema.d.ts.map