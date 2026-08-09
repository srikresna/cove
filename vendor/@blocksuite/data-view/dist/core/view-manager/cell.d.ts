import { type ReadonlySignal } from '@preact/signals-core';
import type { Property } from './property.js';
import type { Row } from './row.js';
import type { SingleView } from './single-view.js';
export interface Cell<RawValue = unknown, JsonValue = unknown, Data extends Record<string, unknown> = Record<string, unknown>> {
    readonly view: SingleView;
    readonly rowId: string;
    readonly row: Row;
    readonly propertyId: string;
    readonly property: Property<RawValue, JsonValue, Data>;
    readonly isEmpty$: ReadonlySignal<boolean>;
    readonly value$: ReadonlySignal<RawValue | undefined>;
    readonly jsonValue$: ReadonlySignal<JsonValue | undefined>;
    readonly stringValue$: ReadonlySignal<string | undefined>;
    valueSet(value: RawValue | undefined): void;
    jsonValueSet(value: JsonValue | undefined): void;
}
export declare class CellBase<RawValue = unknown, JsonValue = unknown, Data extends Record<string, unknown> = Record<string, unknown>> implements Cell<RawValue, JsonValue, Data> {
    view: SingleView;
    propertyId: string;
    rowId: string;
    get dataSource(): import("../index.js").DataSource;
    meta$: ReadonlySignal<import("../index.js").PropertyMetaConfig | undefined>;
    value$: ReadonlySignal<RawValue>;
    isEmpty$: ReadonlySignal<boolean>;
    jsonValue$: ReadonlySignal<JsonValue | undefined>;
    property$: ReadonlySignal<Property<RawValue, JsonValue, Data>>;
    stringValue$: ReadonlySignal<string | undefined>;
    get property(): Property<RawValue, JsonValue, Data>;
    get row(): Row;
    constructor(view: SingleView, propertyId: string, rowId: string);
    valueSet(value: RawValue | undefined): void;
    jsonValueSet(value: JsonValue | undefined): void;
}
//# sourceMappingURL=cell.d.ts.map