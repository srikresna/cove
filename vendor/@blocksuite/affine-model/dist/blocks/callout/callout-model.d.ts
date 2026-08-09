import type { IconData } from '@blocksuite/affine-shared/services';
import { BlockModel, type Text } from '@blocksuite/store';
import type { BlockMeta } from '../../utils/types';
export type CalloutProps = {
    icon?: IconData;
    text: Text;
    backgroundColorName?: string;
} & BlockMeta;
export declare const CalloutBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<CalloutProps>;
        flavour: "affine:callout";
    } & {
        version: number;
        role: "hub";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<CalloutProps>) | undefined;
};
export declare class CalloutBlockModel extends BlockModel<CalloutProps> {
}
export declare const CalloutBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=callout-model.d.ts.map