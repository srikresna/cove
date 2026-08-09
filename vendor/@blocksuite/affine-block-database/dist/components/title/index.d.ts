import type { DataViewUILogicBase } from '@blocksuite/data-view';
import { ShadowlessElement } from '@blocksuite/std';
import type { Text } from '@blocksuite/store';
import type { DatabaseBlockComponent } from '../../database-block.js';
declare const DatabaseTitle_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DatabaseTitle extends DatabaseTitle_base {
    static styles: import("lit").CSSResult;
    private readonly compositionEnd;
    private readonly onBlur;
    private readonly onFocus;
    private readonly onInput;
    private readonly onKeyDown;
    updateText: () => void;
    get database(): DatabaseBlockComponent | null;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor input;
    private readonly isComposing$;
    private readonly isFocus$;
    private onPressEnterKey;
    get readonly$(): import("@preact/signals-core").ReadonlySignal<boolean>;
    private readonly text$;
    accessor titleText: Text;
    accessor dataViewLogic: DataViewUILogicBase;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-title': DatabaseTitle;
    }
}
export {};
//# sourceMappingURL=index.d.ts.map