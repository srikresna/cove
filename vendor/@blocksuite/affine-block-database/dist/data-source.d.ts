import type { ColumnDataType, DatabaseBlockModel } from '@blocksuite/affine-model';
import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type DatabaseFlags, DataSourceBase, type DataViewDataType, type PropertyMetaConfig, type TypeInstance, type ViewManager, type ViewMeta } from '@blocksuite/data-view';
import type { EditorHost } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
type SpacialProperty = {
    valueSet: (rowId: string, propertyId: string, value: unknown) => void;
    valueGet: (rowId: string, propertyId: string) => unknown;
};
export declare class DatabaseBlockDataSource extends DataSourceBase {
    get parentProvider(): import("@blocksuite/global/di").ServiceProvider;
    spacialProperties: Record<string, SpacialProperty>;
    isSpacialProperty(propertyType: string): boolean;
    spacialValueGet(rowId: string, propertyId: string, propertyType: string): unknown;
    static externalProperties: import("@preact/signals-core").Signal<PropertyMetaConfig[]>;
    static propertiesList: ReadonlySignal<(PropertyMetaConfig<"created-time", {}, number | null, number | null> | PropertyMetaConfig | PropertyMetaConfig<"link", {}, string, string> | PropertyMetaConfig<"checkbox", {}, boolean, boolean> | PropertyMetaConfig<"date", {}, number | null, number | null> | PropertyMetaConfig<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]> | PropertyMetaConfig<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null> | PropertyMetaConfig<"progress", {}, number, number> | PropertyMetaConfig<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null> | PropertyMetaConfig<"image", {}, string | null, string | null> | PropertyMetaConfig<"rich-text", {}, import("./properties/rich-text/define.js").RichTextCellType | undefined, string> | PropertyMetaConfig<"title", {}, import("@blocksuite/store").Text<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }> | undefined, string>)[]>;
    static propertiesMap: ReadonlySignal<{
        [k: string]: PropertyMetaConfig;
    }>;
    private _batch;
    private readonly _model;
    featureFlags$: ReadonlySignal<DatabaseFlags>;
    properties$: ReadonlySignal<string[]>;
    readonly$: ReadonlySignal<boolean>;
    rows$: ReadonlySignal<string[]>;
    viewConverts: import("@blocksuite/data-view").ViewConvertConfig[];
    viewDataList$: ReadonlySignal<DataViewDataType[]>;
    viewManager: ViewManager;
    viewMetas: ViewMeta[];
    get doc(): import("@blocksuite/store").Store;
    allPropertyMetas$: ReadonlySignal<PropertyMetaConfig<any, any, any, any>[]>;
    propertyMetas$: ReadonlySignal<PropertyMetaConfig[]>;
    constructor(model: DatabaseBlockModel, init?: (dataSource: DatabaseBlockDataSource) => void);
    private _runCapture;
    private getModelById;
    private newPropertyName;
    cellValueChange(rowId: string, propertyId: string, value: unknown): void;
    cellValueGet(rowId: string, propertyId: string): unknown;
    propertyAdd(insertToPosition: InsertToPosition, ops?: {
        type?: string;
        name?: string;
    }): string | undefined;
    protected getNormalPropertyAndIndex(propertyId: string): {
        column: ColumnDataType<Record<string, unknown>>;
        index: number;
    } | undefined;
    private getPropertyAndIndex;
    private updateProperty;
    propertyDataGet(propertyId: string): Record<string, unknown>;
    propertyDataSet(propertyId: string, data: Record<string, unknown>): void;
    propertyDataTypeGet(propertyId: string): TypeInstance | undefined;
    propertyDelete(id: string): void;
    propertyDuplicate(propertyId: string): string | undefined;
    propertyMetaGet(type: string): PropertyMetaConfig | undefined;
    propertyNameGet(propertyId: string): string;
    propertyNameSet(propertyId: string, name: string): void;
    propertyReadonlyGet(propertyId: string): boolean;
    propertyTypeGet(propertyId: string): string | undefined;
    propertyTypeSet(propertyId: string, toType: string): void;
    rowAdd(insertPosition: InsertToPosition | number): string;
    rowDelete(ids: string[]): void;
    rowMove(rowId: string, position: InsertToPosition): void;
    viewDataAdd(viewData: DataViewDataType): string;
    viewDataDelete(viewId: string): void;
    viewDataDuplicate(id: string): string;
    viewDataGet(viewId: string): DataViewDataType | undefined;
    viewDataMoveTo(id: string, position: InsertToPosition): void;
    viewDataUpdate<ViewData extends DataViewDataType>(id: string, updater: (data: ViewData) => Partial<ViewData>): void;
    viewMetaGet(type: string): ViewMeta;
    viewMetaGetById(viewId: string): ViewMeta | undefined;
}
export declare const databaseViewInitTemplate: (datasource: DatabaseBlockDataSource, viewType: string) => void;
export declare const convertToDatabase: (host: EditorHost, viewType: string) => void;
export {};
//# sourceMappingURL=data-source.d.ts.map