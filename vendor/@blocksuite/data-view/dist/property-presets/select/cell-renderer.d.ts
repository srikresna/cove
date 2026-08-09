import type { SelectTag } from '../../core/index.js';
import { BaseCellRenderer } from '../../core/property/index.js';
import { type SelectPropertyData } from './define.js';
export declare class SelectCell extends BaseCellRenderer<string, string, SelectPropertyData> {
    closePopup?: () => void;
    private readonly popTagSelect;
    _editComplete: () => void;
    _onOptionsChange: (options: SelectTag[]) => void;
    options$: import("@preact/signals-core").ReadonlySignal<{
        id: string;
        value: string;
        color: string;
    }[]>;
    _value$: import("@preact/signals-core").ReadonlySignal<string[]>;
    afterEnterEditingMode(): void;
    beforeExitEditingMode(): void;
    render(): import("lit-html").TemplateResult;
}
export declare const selectPropertyConfig: import("../../index.js").PropertyMetaConfig<"select", {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}, string | null, string | null>;
//# sourceMappingURL=cell-renderer.d.ts.map