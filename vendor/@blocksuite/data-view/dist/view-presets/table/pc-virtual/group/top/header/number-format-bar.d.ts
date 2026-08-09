import { LitElement } from 'lit';
import type { Property } from '../../../../../../core/view-manager/property';
declare const DatabaseNumberFormatBar_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DatabaseNumberFormatBar extends DatabaseNumberFormatBar_base {
    static styles: import("lit").CSSResult;
    private readonly _decrementDecimalPlaces;
    private readonly _incrementDecimalPlaces;
    render(): import("lit-html").TemplateResult<1>;
    accessor column: Property;
}
declare global {
    interface HTMLElementTagNameMap {
        'virtual-database-number-format-bar': DatabaseNumberFormatBar;
    }
}
export {};
//# sourceMappingURL=number-format-bar.d.ts.map