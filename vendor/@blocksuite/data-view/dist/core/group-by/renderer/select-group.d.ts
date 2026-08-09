import type { SelectTag } from '../../logical/index.js';
import { BaseGroup } from './base.js';
export declare class SelectGroupView extends BaseGroup<string, {
    options: SelectTag[];
}> {
    static styles: import("lit").CSSResult;
    private readonly _click;
    get tag(): {
        id: string;
        value: string;
        color: string;
    } | undefined;
    protected render(): unknown;
    updateTag(tag: Partial<SelectTag>): void;
}
//# sourceMappingURL=select-group.d.ts.map