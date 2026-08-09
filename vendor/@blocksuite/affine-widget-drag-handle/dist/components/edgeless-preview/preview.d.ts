import { LitElement } from 'lit';
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-dnd-preview-element': EdgelessDndPreviewElement;
    }
}
export declare const EDGELESS_DND_PREVIEW_ELEMENT = "edgeless-dnd-preview-element";
export declare class EdgelessDndPreviewElement extends LitElement {
    static styles: import("lit").CSSResult;
    accessor elementTypes: {
        type: string;
    }[];
    private _getPreviewIcon;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=preview.d.ts.map