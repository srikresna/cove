import type { ColumnDataType } from '@blocksuite/affine-model';
import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import { DataSourceBase, type PropertyMetaConfig } from '@blocksuite/data-view';
import type { EditorHost } from '@blocksuite/std';
import type { Block, Store } from '@blocksuite/store';
import { Subject } from 'rxjs';
import { blockMetaMap } from './block-meta/index.js';
import type { DataViewBlockModel } from './data-view-model.js';
export type BlockQueryDataSourceConfig = {
    type: keyof typeof blockMetaMap;
};
export declare class BlockQueryDataSource extends DataSourceBase {
    private readonly host;
    private readonly block;
    private readonly columnMetaMap;
    private readonly meta;
    blockMap: Map<string, Block>;
    docDisposeMap: Map<string, () => void>;
    slots: {
        update: Subject<unknown>;
    };
    private get blocks();
    get properties(): string[];
    get propertyMetas(): PropertyMetaConfig[];
    get rows(): string[];
    get workspace(): import("@blocksuite/store").Workspace;
    constructor(host: EditorHost, block: DataViewBlockModel, config: BlockQueryDataSourceConfig);
    private getProperty;
    private newColumnName;
    cellValueChange(rowId: string, propertyId: string, value: unknown): void;
    cellValueGet(rowId: string, propertyId: string): unknown;
    getViewColumn(id: string): ColumnDataType<Record<string, unknown>> | undefined;
    listenToDoc(doc: Store): void;
    propertyAdd(insertToPosition: InsertToPosition, ops?: {
        type?: string;
        name?: string;
    }): string;
    propertyDataGet(propertyId: string): Record<string, unknown>;
    propertyDataSet(propertyId: string, data: Record<string, unknown>): void;
    propertyDelete(_id: string): void;
    propertyDuplicate(_columnId: string): string | undefined;
    propertyMetaGet(type: string): PropertyMetaConfig;
    propertyNameGet(propertyId: string): string;
    propertyNameSet(propertyId: string, name: string): void;
    propertyReadonlyGet(propertyId: string): boolean;
    propertyTypeGet(propertyId: string): string;
    propertyTypeSet(propertyId: string, toType: string): void;
    rowAdd(_insertPosition: InsertToPosition | number): string;
    rowDelete(_ids: string[]): void;
    rowMove(_rowId: string, _position: InsertToPosition): void;
}
//# sourceMappingURL=data-source.d.ts.map