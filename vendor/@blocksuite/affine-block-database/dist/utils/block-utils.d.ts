import type { CellDataType, ColumnDataType, ColumnUpdater, DatabaseBlockModel, ViewBasicDataType } from '@blocksuite/affine-model';
import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { BlockModel } from '@blocksuite/store';
export declare function addProperty(model: DatabaseBlockModel, position: InsertToPosition, column: Omit<ColumnDataType, 'id'> & {
    id?: string;
}): string;
export declare function copyCellsByProperty(model: DatabaseBlockModel, fromId: ColumnDataType['id'], toId: ColumnDataType['id']): void;
export declare function deleteColumn(model: DatabaseBlockModel, columnId: ColumnDataType['id']): void;
export declare function deleteRows(model: DatabaseBlockModel, rowIds: string[]): void;
export declare function deleteView(model: DatabaseBlockModel, id: string): void;
export declare function duplicateView(model: DatabaseBlockModel, id: string): string;
export declare function getCell(model: DatabaseBlockModel, rowId: BlockModel['id'], columnId: ColumnDataType['id']): CellDataType | null;
export declare function getProperty(model: DatabaseBlockModel, id: ColumnDataType['id']): ColumnDataType | undefined;
export declare function moveViewTo(model: DatabaseBlockModel, id: string, position: InsertToPosition): void;
export declare function updateCell(model: DatabaseBlockModel, rowId: string, cell: CellDataType): void;
export declare function updateCells(model: DatabaseBlockModel, columnId: string, cells: Record<string, unknown>): void;
export declare function updateProperty(model: DatabaseBlockModel, id: string, updater: ColumnUpdater, defaultValue?: Record<string, unknown>): string | undefined;
export declare const updateView: <ViewData extends ViewBasicDataType>(model: DatabaseBlockModel, id: string, update: (data: ViewData) => Partial<ViewData>) => void;
export declare const DATABASE_CONVERT_WHITE_LIST: string[];
//# sourceMappingURL=block-utils.d.ts.map