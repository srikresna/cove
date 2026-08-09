import { LitElement } from 'lit';
export declare class DocTitle extends LitElement {
    static styles: import("lit").CSSResult;
    accessor title: string;
    accessor open: (event: MouseEvent) => void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-linked-doc-title': DocTitle;
    }
}
//# sourceMappingURL=doc-title.d.ts.map