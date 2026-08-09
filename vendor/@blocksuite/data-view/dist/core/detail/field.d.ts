import { ShadowlessElement } from '@blocksuite/std';
import type { DataViewCellLifeCycle } from '../property/index.js';
import type { Property } from '../view-manager/property.js';
import type { SingleView } from '../view-manager/single-view.js';
declare const RecordField_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class RecordField extends RecordField_base {
    static styles: import("lit").CSSResult;
    private readonly _cell;
    _click: (e: MouseEvent) => void;
    _clickLeft: (e: MouseEvent) => void;
    accessor column: Property;
    accessor rowId: string;
    cell$: import("@preact/signals-core").ReadonlySignal<import("../index.js").Cell<unknown, unknown, Record<string, unknown>>>;
    changeEditing: (editing: boolean) => void;
    get cell(): DataViewCellLifeCycle | undefined;
    private get readonly();
    render(): import("lit-html").TemplateResult | undefined;
    isEditing$: import("@preact/signals-core").Signal<boolean>;
    isFocus$: import("@preact/signals-core").Signal<boolean>;
    accessor view: SingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-record-field': RecordField;
    }
}
export {};
//# sourceMappingURL=field.d.ts.map