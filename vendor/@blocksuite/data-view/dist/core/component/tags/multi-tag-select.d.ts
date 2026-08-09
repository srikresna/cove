import { type PopupTarget } from '@blocksuite/affine-components/context-menu';
import { ShadowlessElement } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
import type { SelectTag } from '../../logical/index.js';
export type TagManagerOptions = {
    mode?: 'single' | 'multi';
    value: ReadonlySignal<string[]>;
    onChange: (value: string[]) => void;
    options: ReadonlySignal<SelectTag[]>;
    onOptionsChange: (options: SelectTag[]) => void;
    onComplete?: () => void;
    initialDraftText?: string;
};
export declare function consumeTagDraftFromTableCellHost(fromElement: Element): string | undefined;
declare const MultiTagSelect_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MultiTagSelect extends MultiTagSelect_base {
    private readonly _clickItemOption;
    private readonly _onInput;
    private readonly _onInputKeydown;
    private readonly tagManager;
    private readonly selectedTag$;
    sortContext: import("../../utils/wc-dnd/sort/sort-context.js").SortContext;
    private get text();
    private renderInput;
    private renderTag;
    private renderTags;
    private setSelectedOption;
    connectedCallback(): void;
    protected firstUpdated(): void;
    render(): import("lit-html").TemplateResult;
    private readonly _selectInput;
    accessor mode: 'multi' | 'single';
    accessor onChange: (value: string[]) => void;
    accessor onComplete: () => void;
    accessor onOptionsChange: (options: SelectTag[]) => void;
    accessor options: ReadonlySignal<SelectTag[]>;
    private readonly selectedIndex$;
    accessor value: ReadonlySignal<string[]>;
    accessor initialDraftText: string | undefined;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-multi-tag-select': MultiTagSelect;
    }
}
export type TagSelectOptions = {
    name: string;
    minWidth?: number;
    container?: HTMLElement;
} & TagManagerOptions;
export declare const popTagSelect: (target: PopupTarget, ops: TagSelectOptions) => () => void;
export {};
//# sourceMappingURL=multi-tag-select.d.ts.map