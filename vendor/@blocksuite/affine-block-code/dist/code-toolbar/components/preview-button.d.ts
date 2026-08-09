import { LitElement, nothing } from 'lit';
import type { CodeBlockComponent } from '../../code-block';
declare const PreviewButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class PreviewButton extends PreviewButton_base {
    static styles: import("lit").CSSResult;
    private readonly _toggle;
    get preview(): boolean;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor blockComponent: CodeBlockComponent;
}
export {};
//# sourceMappingURL=preview-button.d.ts.map