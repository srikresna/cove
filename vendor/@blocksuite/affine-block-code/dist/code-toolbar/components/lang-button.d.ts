import { LitElement } from 'lit';
import type { CodeBlockComponent } from '../..';
declare const LanguageListButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class LanguageListButton extends LanguageListButton_base {
    static styles: import("lit").CSSResult;
    private _abortController?;
    private readonly _clickLangBtn;
    private _sortedBundledLanguages;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult;
    private accessor _langButton;
    accessor blockComponent: CodeBlockComponent;
    accessor onActiveStatusChange: (active: boolean) => void;
}
export {};
//# sourceMappingURL=lang-button.d.ts.map