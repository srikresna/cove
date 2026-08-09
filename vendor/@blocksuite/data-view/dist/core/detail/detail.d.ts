import type { UniComponent } from '@blocksuite/affine-shared/types';
import { ShadowlessElement } from '@blocksuite/std';
import type { SingleView } from '../view-manager/single-view.js';
import { DetailSelection } from './selection.js';
export type DetailSlotProps = {
    view: SingleView;
    rowId: string;
    openDoc: (docId: string) => void;
};
export interface DetailSlots {
    header?: UniComponent<DetailSlotProps>;
    note?: UniComponent<DetailSlotProps>;
}
declare const RecordDetail_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class RecordDetail extends RecordDetail_base {
    static styles: import("lit").CSSResult;
    _clickAddProperty: () => void;
    accessor view: SingleView;
    properties$: import("@preact/signals-core").ReadonlySignal<import("../index.js").Property<unknown, unknown, Record<string, unknown>>[]>;
    selection: DetailSelection;
    private get readonly();
    private renderHeader;
    private renderNote;
    connectedCallback(): void;
    row$: import("@preact/signals-core").ReadonlySignal<import("../index.js").Row>;
    hasNext(): boolean;
    hasPrev(): boolean;
    nextRow(): void;
    prevRow(): void;
    render(): import("lit-html").TemplateResult;
    accessor addPropertyButton: HTMLElement;
    accessor detailSlots: DetailSlots | undefined;
    accessor openDoc: (docId: string) => void;
    accessor rowId: string;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-record-detail': RecordDetail;
    }
}
export declare const createRecordDetail: (ops: {
    view: SingleView;
    rowId: string;
    detail: DetailSlots;
    openDoc: (docId: string) => void;
}) => import("lit-html").TemplateResult;
export {};
//# sourceMappingURL=detail.d.ts.map