import { LitElement, type TemplateResult } from 'lit';
declare const CitationCard_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class CitationCard extends CitationCard_base {
    static styles: import("lit").CSSResult;
    private readonly _IconTemplate;
    render(): TemplateResult<1>;
    accessor icon: TemplateResult | string | undefined;
    accessor citationTitle: string;
    accessor citationContent: string | undefined;
    accessor citationIdentifier: string;
    accessor onClickCallback: ((e: MouseEvent) => void) | undefined;
    accessor onDoubleClickCallback: ((e: MouseEvent) => void) | undefined;
    accessor active: boolean;
}
export {};
//# sourceMappingURL=citation.d.ts.map