import type { ColumnDataType } from '@blocksuite/affine-model';
import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { DataViewDataType } from '@blocksuite/data-view';
import { BlockModel } from '@blocksuite/store';
type Props = {
    title: string;
    views: DataViewDataType[];
    columns: ColumnDataType[];
    cells: Record<string, Record<string, unknown>>;
};
export declare class DataViewBlockModel extends BlockModel<Props> {
    constructor();
    applyViewsUpdate(): void;
    deleteView(id: string): void;
    duplicateView(id: string): string;
    moveViewTo(id: string, position: InsertToPosition): void;
    updateView(id: string, update: (data: DataViewDataType) => Partial<DataViewDataType>): void;
}
export declare const DataViewBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<Props>;
        flavour: "affine:data-view";
    } & {
        role: "hub";
        version: number;
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<Props>) | undefined;
};
export declare const DataViewBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=data-view-model.d.ts.map