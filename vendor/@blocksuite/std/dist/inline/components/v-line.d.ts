import type { DeltaInsert } from '@blocksuite/store';
import { LitElement, type TemplateResult } from 'lit';
export declare class VLine extends LitElement {
    get inlineEditor(): import("../inline-editor.js").InlineEditor<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }>;
    get vElements(): import("./v-element.js").VElement<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }>[];
    get vTextContent(): string;
    get vTextLength(): number;
    get vTexts(): import("./v-text.js").VText[];
    createRenderRoot(): this;
    protected firstUpdated(): void;
    getUpdateComplete(): Promise<boolean>;
    render(): TemplateResult | undefined;
    renderVElements(): TemplateResult<1>;
    accessor elements: [TemplateResult<1>, DeltaInsert][];
    accessor endOffset: number;
    accessor index: number;
    accessor startOffset: number;
}
declare global {
    interface HTMLElementTagNameMap {
        'v-line': VLine;
    }
}
//# sourceMappingURL=v-line.d.ts.map