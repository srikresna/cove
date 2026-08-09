import { type PopupTarget } from '@blocksuite/affine-components/context-menu';
import { ShadowlessElement } from '@blocksuite/std';
import type { Middleware } from '@floating-ui/dom';
import type { Property } from '../view-manager/property.js';
import type { SingleView } from '../view-manager/single-view.js';
declare const DataViewPropertiesSettingView_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DataViewPropertiesSettingView extends DataViewPropertiesSettingView_base {
    static styles: import("lit").CSSResult;
    accessor view: SingleView;
    items$: import("@preact/signals-core").ReadonlySignal<string[]>;
    renderProperty: (property: Property) => import("lit-html").TemplateResult<1>;
    sortContext: import("../utils/wc-dnd/sort/sort-context.js").SortContext;
    private itemsGroup;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor groupContainer: HTMLElement;
    accessor onBack: (() => void) | undefined;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-properties-setting': DataViewPropertiesSettingView;
    }
}
export declare const popPropertiesSetting: (target: PopupTarget, props: {
    view: SingleView;
    onClose?: () => void;
    onBack?: () => void;
}, middleware?: Array<Middleware | null | undefined | false>) => void;
export {};
//# sourceMappingURL=properties.d.ts.map