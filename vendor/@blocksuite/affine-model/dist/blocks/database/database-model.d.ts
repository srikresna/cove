import type { Text } from '@blocksuite/store';
import { BlockModel } from '@blocksuite/store';
import type { ColumnDataType, SerializedCells, ViewBasicDataType } from './types.js';
export type DatabaseBlockProps = {
    views: ViewBasicDataType[];
    title: Text;
    cells: SerializedCells;
    columns: Array<ColumnDataType>;
    comments?: Record<string, boolean>;
};
export declare class DatabaseBlockModel extends BlockModel<DatabaseBlockProps> {
}
export declare const DatabaseBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<DatabaseBlockProps>;
        flavour: "affine:database";
    } & {
        role: "hub";
        version: number;
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<DatabaseBlockProps>) | undefined;
};
export declare const DatabaseBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=database-model.d.ts.map