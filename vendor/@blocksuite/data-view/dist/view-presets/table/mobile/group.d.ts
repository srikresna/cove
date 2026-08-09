import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../core/group-by/trait.js';
import type { Row } from '../../../core/index.js';
import type { MobileTableViewUILogic } from './table-view-ui-logic.js';
declare const MobileTableGroup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileTableGroup extends MobileTableGroup_base {
    static styles: import("lit").CSSResult;
    collapsed$: import("@preact/signals-core").Signal<boolean>;
    private storageLoaded;
    private _loadCollapsedState;
    private readonly _toggleCollapse;
    private readonly clickAddRow;
    private readonly clickAddRowInStart;
    private readonly clickGroupOptions;
    private readonly renderGroupHeader;
    get rows(): Row[];
    private renderRows;
    willUpdate(changed: Map<PropertyKey, unknown>): void;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor group: Group | undefined;
    accessor tableViewLogic: MobileTableViewUILogic;
    get view(): import("../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-table-group': MobileTableGroup;
    }
}
export {};
//# sourceMappingURL=group.d.ts.map