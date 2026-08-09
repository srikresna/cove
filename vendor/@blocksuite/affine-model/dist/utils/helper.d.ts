import type { Constructor } from '@blocksuite/global/utils';
import type { GfxCompatibleProps } from '@blocksuite/std/gfx';
import { type BaseBlockTransformer, type BlockModel, type InternalPrimitives } from '@blocksuite/store';
import type { BlockMeta } from './types';
export type EmbedProps<Props = object> = Props & GfxCompatibleProps & BlockMeta & {
    comments?: Record<string, boolean>;
};
export declare function defineEmbedModel<Props extends object, T extends Constructor<BlockModel<Props>> = Constructor<BlockModel<Props>>>(BlockModelSuperClass: T): {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<EmbedProps<Props>>;
};
export type EmbedBlockModel<Props = object> = BlockModel<EmbedProps<Props>>;
export declare function createEmbedBlockSchema<Props extends object, Model extends EmbedBlockModel<Props>, Transformer extends BaseBlockTransformer<EmbedProps<Props>> = BaseBlockTransformer<EmbedProps<Props>>>({ name, version, toModel, props, transformer, }: {
    name: string;
    version: number;
    toModel: () => Model;
    props?: (internalPrimitives: InternalPrimitives) => Props;
    transformer?: () => Transformer;
}): {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<EmbedProps<Props>>;
        flavour: `affine:embed-${string}`;
    } & {
        version: number;
        role: "content";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => Transformer) | undefined;
};
//# sourceMappingURL=helper.d.ts.map