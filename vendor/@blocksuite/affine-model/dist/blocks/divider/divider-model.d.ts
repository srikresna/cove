import { BlockModel } from '@blocksuite/store';
export declare const DividerBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<object>;
        flavour: "affine:divider";
    } & {
        version: number;
        role: "content";
        children: never[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<object>) | undefined;
};
type Props = {
    text: string;
};
export declare class DividerBlockModel extends BlockModel<Props> {
}
export declare const DividerBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=divider-model.d.ts.map