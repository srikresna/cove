import type { Text } from '@blocksuite/store';
import { BlockModel } from '@blocksuite/store';
import type { TextAlign } from '../../consts';
import type { BlockMeta } from '../../utils/types';
export type ListType = 'bulleted' | 'numbered' | 'todo' | 'toggle';
export type ListProps = {
    type: ListType;
    text: Text;
    textAlign?: TextAlign;
    checked: boolean;
    collapsed: boolean;
    order: number | null;
    comments?: Record<string, boolean>;
} & BlockMeta;
export declare const ListBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<ListProps>;
        flavour: "affine:list";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<ListProps>) | undefined;
};
export declare const ListBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class ListBlockModel extends BlockModel<ListProps> {
}
//# sourceMappingURL=list-model.d.ts.map