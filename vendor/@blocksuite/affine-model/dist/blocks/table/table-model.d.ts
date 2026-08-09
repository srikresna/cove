import type { DeltaInsert, Text } from '@blocksuite/store';
import { BlockModel } from '@blocksuite/store';
import type { TextAlign } from '../../consts';
import type { BlockMeta } from '../../utils/types';
export type TableCell = {
    text: Text;
};
export interface TableRow {
    rowId: string;
    order: string;
    backgroundColor?: string;
}
export interface TableColumn {
    columnId: string;
    order: string;
    backgroundColor?: string;
    width?: number;
}
export interface TableBlockProps extends BlockMeta {
    rows: Record<string, TableRow>;
    columns: Record<string, TableColumn>;
    cells: Record<string, TableCell>;
    comments?: Record<string, boolean>;
    textAlign?: TextAlign;
}
export interface TableCellSerialized {
    text: {
        delta: DeltaInsert[];
    };
}
export interface TableBlockPropsSerialized {
    rows: Record<string, TableRow>;
    columns: Record<string, TableColumn>;
    cells: Record<string, TableCellSerialized>;
}
export declare class TableBlockModel extends BlockModel<TableBlockProps> {
}
export declare const TableModelFlavour = "affine:table";
export declare const TableBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<TableBlockProps>;
        flavour: "affine:table";
    } & {
        isFlatData: true;
        role: "content";
        version: number;
        parent: string[];
        children: never[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<TableBlockProps>) | undefined;
};
export declare const TableBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=table-model.d.ts.map