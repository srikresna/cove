import type { SerializedXYWH } from '@blocksuite/global/gfx';
import { BlockModel } from '@blocksuite/store';
import * as Y from 'yjs';
import { SurfaceBlockModel as BaseSurfaceModel } from '../gfx/index.js';
import { type GfxCompatibleProps } from '../gfx/model/gfx-block-model.js';
export declare const RootBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<{
            title: import("@blocksuite/store").Text<{
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
        flavour: "test:page";
    } & {
        version: number;
        role: "root";
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<{
        title: import("@blocksuite/store").Text<{
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
export declare const RootBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class RootBlockModel extends BlockModel<ReturnType<(typeof RootBlockSchema)['model']['props']>> {
}
export declare const NoteBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<{}>;
        flavour: "test:note";
    } & {
        version: number;
        role: "hub";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<{}>) | undefined;
};
export declare const NoteBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class NoteBlockModel extends BlockModel<ReturnType<(typeof NoteBlockSchema)['model']['props']>> {
}
export declare const HeadingBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<{
            type: string;
            text: import("@blocksuite/store").Text<{
                bold?: true | null | undefined;
                link?: string | null | undefined;
                strike?: true | null | undefined;
                italic?: true | null | undefined;
                underline?: true | null | undefined;
                code?: true | null | undefined;
            }>;
        }>;
        flavour: "test:heading";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<{
        type: string;
        text: import("@blocksuite/store").Text<{
            bold?: true | null | undefined;
            link?: string | null | undefined;
            strike?: true | null | undefined;
            italic?: true | null | undefined;
            underline?: true | null | undefined;
            code?: true | null | undefined;
        }>;
    }>) | undefined;
};
export declare const HeadingBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class HeadingBlockModel extends BlockModel<ReturnType<(typeof HeadingBlockSchema)['model']['props']>> {
}
export declare const SurfaceBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<{
            elements: import("@blocksuite/store").Boxed<Y.Map<Y.Map<unknown>>>;
        }>;
        flavour: "test:surface";
    } & {
        version: number;
        role: "hub";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<{
        elements: import("@blocksuite/store").Boxed<Y.Map<Y.Map<unknown>>>;
    }>) | undefined;
};
export declare const SurfaceBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class SurfaceBlockModel extends BaseSurfaceModel {
    _init(): void;
}
type GfxTestBlockProps = {
    xywh: SerializedXYWH;
    rotate: number;
    index: string;
} & GfxCompatibleProps;
export declare const TestGfxBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<GfxTestBlockProps>;
        flavour: "test:gfx-block";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<GfxTestBlockProps>) | undefined;
};
export declare const TestGfxBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const TestGfxBlockModel_base: {
    new (): import("../gfx/index.js").GfxBlockElementModel<GfxTestBlockProps>;
};
export declare class TestGfxBlockModel extends TestGfxBlockModel_base {
}
export {};
//# sourceMappingURL=test-schema.d.ts.map