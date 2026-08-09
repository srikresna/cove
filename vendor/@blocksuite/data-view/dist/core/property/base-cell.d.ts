import { ShadowlessElement } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
import type { PropertyValues } from 'lit';
import type { Cell } from '../view-manager/cell.js';
import type { CellRenderProps, DataViewCellLifeCycle } from './manager.js';
declare const BaseCellRenderer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare abstract class BaseCellRenderer<RawValue = unknown, JsonValue = unknown, Data extends Record<string, unknown> = Record<string, unknown>> extends BaseCellRenderer_base implements DataViewCellLifeCycle, CellRenderProps<Data, RawValue, JsonValue> {
    get expose(): this;
    accessor cell: Cell<RawValue, JsonValue, Data>;
    readonly$: ReadonlySignal<boolean>;
    value$: ReadonlySignal<RawValue | undefined>;
    get property(): import("../index.js").Property<RawValue, JsonValue, Data>;
    get readonly(): boolean;
    get row(): import("../index.js").Row;
    get value(): RawValue | undefined;
    get view(): import("../index.js").SingleView;
    beforeEnterEditMode(): boolean;
    blurCell(): boolean;
    type: string | undefined;
    protected shouldUpdate(_changedProperties: PropertyValues): boolean;
    connectedCallback(): void;
    focusCell(): boolean;
    forceUpdate(): void;
    valueSetImmediate(value: RawValue | undefined): void;
    valueSetNextTick(value: RawValue | undefined): void;
    onCopy(_e: ClipboardEvent): void;
    onCut(_e: ClipboardEvent): void;
    afterEnterEditingMode(): void;
    beforeExitEditingMode(): void;
    onPaste(_e: ClipboardEvent): void;
    accessor isEditing$: ReadonlySignal<boolean>;
    accessor selectCurrentCell: (editing: boolean) => void;
}
export {};
//# sourceMappingURL=base-cell.d.ts.map