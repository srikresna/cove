import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type ReadonlySignal } from '@preact/signals-core';
import type { GroupBy, GroupProperty } from '../common/types.js';
import type { TypeInstance } from '../logical/type.js';
import type { Property } from '../view-manager/property.js';
import type { Row } from '../view-manager/row.js';
import type { SingleView } from '../view-manager/single-view.js';
import type { GroupByConfig } from './types.js';
export type GroupInfo<RawValue = unknown, JsonValue = unknown, Data extends Record<string, unknown> = Record<string, unknown>> = {
    config: GroupByConfig;
    property: Property<RawValue, JsonValue, Data>;
    tType: TypeInstance;
};
export declare class Group<RawValue = unknown, JsonValue = unknown, Data extends Record<string, unknown> = Record<string, unknown>> {
    readonly key: string;
    readonly value: JsonValue;
    private readonly groupInfo;
    readonly manager: GroupTrait;
    rows: Row[];
    constructor(key: string, value: JsonValue, groupInfo: GroupInfo<RawValue, JsonValue, Data>, manager: GroupTrait);
    get property(): Property<RawValue, JsonValue, Data>;
    name$: ReadonlySignal<string>;
    private get config();
    get tType(): TypeInstance;
    get view(): import("@blocksuite/affine-shared/types").UniComponent<import("./types.js").GroupRenderProps<unknown, {}>>;
    hide$: ReadonlySignal<boolean>;
    hideSet(hide: boolean): void;
}
export declare class GroupTrait {
    private readonly groupBy$;
    view: SingleView;
    private readonly ops;
    hideEmpty$: import("@preact/signals-core").Signal<boolean>;
    sortAsc$: import("@preact/signals-core").Signal<boolean>;
    groupProperties$: ReadonlySignal<GroupProperty[]>;
    groupPropertiesMap$: ReadonlySignal<Record<string, GroupProperty>>;
    /**
     * Synchronize sortAsc$ with the GroupBy sort descriptor
     */
    constructor(groupBy$: ReadonlySignal<GroupBy | undefined>, view: SingleView, ops: {
        groupBySet: (g: GroupBy | undefined) => void;
        sortGroup: (keys: string[], asc?: boolean) => string[];
        sortRow: (groupKey: string, rows: Row[]) => Row[];
        changeGroupSort: (keys: string[]) => void;
        changeRowSort: (groupKeys: string[], groupKey: string, keys: string[]) => void;
        changeGroupHide?: (key: string, hide: boolean) => void;
    });
    groupInfo$: ReadonlySignal<GroupInfo<unknown, unknown, Record<string, unknown>> | undefined>;
    staticInfo$: ReadonlySignal<{
        staticMap: {
            [k: string]: Group<unknown, unknown, Record<string, unknown>>;
        };
        groupInfo: GroupInfo<unknown, unknown, Record<string, unknown>>;
    } | undefined>;
    groupDataMap$: ReadonlySignal<Record<string, Group<unknown, unknown, Record<string, unknown>>> | undefined>;
    groupsDataList$: ReadonlySignal<Group<unknown, unknown, Record<string, unknown>>[] | undefined>;
    /**
     * Computed list of groups including hidden ones, used by settings UI.
     */
    groupsDataListAll$: ReadonlySignal<Group<unknown, unknown, Record<string, unknown>>[] | undefined>;
    /** Whether all groups are currently hidden */
    allHidden$: ReadonlySignal<boolean>;
    /**
     * Toggle hiding of empty groups.
     */
    setHideEmpty(value: boolean): void;
    isGroupHidden(key: string): boolean;
    setGroupHide(key: string, hide: boolean): void;
    /**
     * Set sort order for date groupings and update GroupBy sort descriptor.
     */
    setDateSortOrder(asc: boolean): void;
    addToGroup(rowId: string, key: string): void;
    changeGroupMode(modeName: string): void;
    changeGroup(columnId: string | undefined): void;
    property$: ReadonlySignal<Property<unknown, unknown, Record<string, unknown>> | undefined>;
    get addGroup(): ((config: import("../index.js").WithCommonPropertyConfig<{
        text: string;
        oldData: {};
    }>) => {}) | undefined;
    updateData: (data: NonNullable<unknown>) => void;
    changeGroupSort(keys: string[]): void;
    moveCardTo(rowId: string, fromGroupKey: string | undefined, toGroupKey: string, position: InsertToPosition): void;
    moveGroupTo(groupKey: string, position: InsertToPosition): void;
    removeFromGroup(rowId: string, key: string): void;
    updateValue(rows: string[], value: unknown): void;
}
export declare const groupTraitKey: import("../traits/key.js").TraitKey<GroupTrait>;
export declare const sortByManually: <T>(arr: T[], getId: (v: T) => string, ids: string[]) => T[];
//# sourceMappingURL=trait.d.ts.map