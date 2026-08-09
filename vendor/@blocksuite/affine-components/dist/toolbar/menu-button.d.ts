import { type ButtonPopperOptions } from '@blocksuite/affine-shared/utils';
import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
declare const EditorMenuButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EditorMenuButton extends EditorMenuButton_base {
    static styles: import("lit").CSSResult;
    private _popper;
    private _updatePopper;
    willUpdate(changedProperties: PropertyValues): void;
    firstUpdated(): void;
    hide(): void;
    render(): TemplateResult<1>;
    show(force?: boolean): void;
    private accessor _content;
    private accessor _trigger;
    accessor button: TemplateResult;
    accessor contentPadding: string | undefined;
    accessor popperOptions: Partial<ButtonPopperOptions>;
}
export declare class EditorMenuContent extends LitElement {
    static styles: import("lit").CSSResult;
    render(): TemplateResult<1>;
}
export declare class EditorMenuAction extends LitElement {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'editor-menu-button': EditorMenuButton;
        'editor-menu-content': EditorMenuContent;
        'editor-menu-action': EditorMenuAction;
    }
}
export {};
//# sourceMappingURL=menu-button.d.ts.map