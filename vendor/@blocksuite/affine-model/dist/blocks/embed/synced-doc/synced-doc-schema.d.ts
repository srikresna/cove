import { type EmbedSyncedDocBlockProps } from './synced-doc-model.js';
export declare const SYNCED_MIN_WIDTH = 370;
export declare const SYNCED_MIN_HEIGHT = 48;
export declare const SYNCED_DEFAULT_WIDTH = 800;
export declare const SYNCED_DEFAULT_MAX_HEIGHT = 800;
export declare const defaultEmbedSyncedDocBlockProps: EmbedSyncedDocBlockProps;
export declare const EmbedSyncedDocBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<import("../../../index.js").EmbedProps<EmbedSyncedDocBlockProps>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<import("../../../index.js").EmbedProps<EmbedSyncedDocBlockProps>>) | undefined;
};
export declare const EmbedSyncedDocBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=synced-doc-schema.d.ts.map