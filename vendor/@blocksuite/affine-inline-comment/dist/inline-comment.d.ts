import { ShadowlessElement } from '@blocksuite/std';
import { type PropertyValues } from 'lit';
declare const InlineComment_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class InlineComment extends InlineComment_base {
    static styles: import("lit").CSSResult;
    accessor commentIds: string[];
    accessor unresolved: boolean;
    private _index;
    private accessor _std;
    accessor highlighted: boolean;
    private get _provider();
    private readonly _handleClick;
    private readonly _handleHighlight;
    connectedCallback(): void;
    willUpdate(_changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=inline-comment.d.ts.map