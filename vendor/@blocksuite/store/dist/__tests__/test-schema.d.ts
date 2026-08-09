import { BlockModel } from '../model/index.js';
export declare const RootBlockSchema: {
    version: number;
    model: {
        props: import("../index.js").PropsGetter<{
            title: import("../index.js").Text<{
                bold?: true | null | undefined;
                link?: string | null | undefined;
                strike?: true | null | undefined;
                italic?: true | null | undefined;
                underline?: true | null | undefined;
                code?: true | null | undefined;
            }>;
            count: number;
            style: Record<string, unknown>;
            items: unknown[];
        }>;
        flavour: "affine:page";
    } & {
        version: number;
        role: "root";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("../index.js").BaseBlockTransformer<{
        title: import("../index.js").Text<{
            bold?: true | null | undefined;
            link?: string | null | undefined;
            strike?: true | null | undefined;
            italic?: true | null | undefined;
            underline?: true | null | undefined;
            code?: true | null | undefined;
        }>;
        count: number;
        style: Record<string, unknown>;
        items: unknown[];
    }>) | undefined;
};
export declare const RootBlockSchemaExtension: import("../index.js").ExtensionType;
export declare class RootBlockModel extends BlockModel<ReturnType<(typeof RootBlockSchema)['model']['props']>> {
}
export declare const NoteBlockSchema: {
    version: number;
    model: {
        props: import("../index.js").PropsGetter<{}>;
        flavour: "affine:note";
    } & {
        version: number;
        role: "hub";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("../index.js").BaseBlockTransformer<{}>) | undefined;
};
export declare const NoteBlockSchemaExtension: import("../index.js").ExtensionType;
export declare const ParagraphBlockSchema: {
    version: number;
    model: {
        props: import("../index.js").PropsGetter<{
            type: string;
            text: import("../index.js").Text<{
                bold?: true | null | undefined;
                link?: string | null | undefined;
                strike?: true | null | undefined;
                italic?: true | null | undefined;
                underline?: true | null | undefined;
                code?: true | null | undefined;
            }>;
        }>;
        flavour: "affine:paragraph";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("../index.js").BaseBlockTransformer<{
        type: string;
        text: import("../index.js").Text<{
            bold?: true | null | undefined;
            link?: string | null | undefined;
            strike?: true | null | undefined;
            italic?: true | null | undefined;
            underline?: true | null | undefined;
            code?: true | null | undefined;
        }>;
    }>) | undefined;
};
export declare const ParagraphBlockSchemaExtension: import("../index.js").ExtensionType;
export declare const ListBlockSchema: {
    version: number;
    model: {
        props: import("../index.js").PropsGetter<{
            type: string;
            text: import("../index.js").Text<{
                bold?: true | null | undefined;
                link?: string | null | undefined;
                strike?: true | null | undefined;
                italic?: true | null | undefined;
                underline?: true | null | undefined;
                code?: true | null | undefined;
            }>;
            checked: boolean;
            collapsed: boolean;
        }>;
        flavour: "affine:list";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("../index.js").BaseBlockTransformer<{
        type: string;
        text: import("../index.js").Text<{
            bold?: true | null | undefined;
            link?: string | null | undefined;
            strike?: true | null | undefined;
            italic?: true | null | undefined;
            underline?: true | null | undefined;
            code?: true | null | undefined;
        }>;
        checked: boolean;
        collapsed: boolean;
    }>) | undefined;
};
export declare const ListBlockSchemaExtension: import("../index.js").ExtensionType;
export declare const DividerBlockSchema: {
    version: number;
    model: {
        props: import("../index.js").PropsGetter<object>;
        flavour: "affine:divider";
    } & {
        version: number;
        role: "content";
        children: never[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("../index.js").BaseBlockTransformer<object>) | undefined;
};
export declare const DividerBlockSchemaExtension: import("../index.js").ExtensionType;
//# sourceMappingURL=test-schema.d.ts.map