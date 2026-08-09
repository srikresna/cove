import type { Text } from '@blocksuite/store';
import { BlockModel } from '@blocksuite/store';
export type RootBlockProps = {
    title: Text;
};
export declare class RootBlockModel extends BlockModel<RootBlockProps> {
    constructor();
    /**
     * A page is empty if it only contains one empty note and the canvas is empty
     */
    isEmpty(): boolean;
}
export declare const RootBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<RootBlockProps>;
        flavour: "affine:page";
    } & {
        version: number;
        role: "root";
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<RootBlockProps>) | undefined;
};
export declare const RootBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=root-block-model.d.ts.map