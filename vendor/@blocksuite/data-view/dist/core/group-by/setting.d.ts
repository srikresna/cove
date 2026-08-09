import { type MenuConfig } from '@blocksuite/affine-components/context-menu';
import { ShadowlessElement } from '@blocksuite/std';
import type { GroupTrait } from './trait.js';
declare const GroupSetting_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class GroupSetting extends GroupSetting_base {
    static styles: import("lit").CSSResult;
    accessor groupTrait: GroupTrait;
    groups$: import("@preact/signals-core").ReadonlySignal<import("./trait.js").Group<unknown, unknown, Record<string, unknown>>[] | undefined>;
    sortContext: import("../utils/wc-dnd/sort/sort-context.js").SortContext;
    connectedCallback(): void;
    protected render(): import("lit-html").TemplateResult<1> | undefined;
    accessor groupContainer: HTMLElement;
}
export declare const buildGroupSelectItems: (group: GroupTrait, onSelect: (id?: string) => void) => MenuConfig[];
export declare const buildGroupSettingItems: (group: GroupTrait, onGroupByClick: () => void, onGroupRemoved?: () => void) => MenuConfig[];
export {};
//# sourceMappingURL=setting.d.ts.map