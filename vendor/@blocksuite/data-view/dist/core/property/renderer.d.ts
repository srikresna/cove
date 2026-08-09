import type { UniComponent } from '@blocksuite/affine-shared/types';
import type { BaseCellRenderer } from './base-cell.js';
import type { CellRenderer, DataViewCellComponent } from './manager.js';
export interface Renderer<Data extends NonNullable<unknown> = NonNullable<unknown>, RawValue = unknown, JsonValue = unknown> {
    type: string;
    icon?: UniComponent;
    cellRenderer: CellRenderer<Data, RawValue, JsonValue>;
}
export declare const createFromBaseCellRenderer: <RawValue = unknown, JsonValue = unknown, Data extends Record<string, unknown> = Record<string, unknown>>(renderer: new () => BaseCellRenderer<RawValue, JsonValue, Data>) => DataViewCellComponent;
//# sourceMappingURL=renderer.d.ts.map