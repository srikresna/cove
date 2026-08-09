import { LitElement } from 'lit';
declare const ResourceStatus_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class ResourceStatus extends ResourceStatus_base {
    static styles: import("lit").CSSResult;
    private _popper;
    private _updatePopper;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _content;
    private accessor _trigger;
    private accessor _actionButton;
    accessor message: string;
    accessor needUpload: boolean;
    accessor action: () => void;
}
export {};
//# sourceMappingURL=status.d.ts.map