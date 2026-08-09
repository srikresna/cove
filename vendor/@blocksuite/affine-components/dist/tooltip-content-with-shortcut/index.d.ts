import { LitElement } from 'lit';
export declare class TooltipContentWithShortcut extends LitElement {
    static styles: import("lit").CSSResult;
    get shortcuts(): string[];
    render(): import("lit-html").TemplateResult<1>;
    accessor tip: string;
    accessor shortcut: string | undefined;
    accessor postfix: string | undefined;
}
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'affine-tooltip-content-with-shortcut': TooltipContentWithShortcut;
    }
}
//# sourceMappingURL=index.d.ts.map