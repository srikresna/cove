import type { EditorIconButton } from '@blocksuite/affine-components/toolbar';
import type { AffineInlineEditor } from '@blocksuite/affine-shared/types';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import type { InlineRange } from '@blocksuite/std/inline';
declare const LinkPopup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class LinkPopup extends LinkPopup_base {
    static styles: import("lit").CSSResult;
    private _bodyOverflowStyle;
    private readonly _createTemplate;
    private readonly _editTemplate;
    get currentLink(): string | null | undefined;
    get currentText(): string;
    private _confirmBtnTemplate;
    private _onConfirm;
    private _onKeydown;
    private _updateConfirmBtn;
    private updateMockSelection;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor abortController: AbortController;
    accessor confirmButton: EditorIconButton | null;
    accessor inlineEditor: AffineInlineEditor;
    accessor linkInput: HTMLInputElement | null;
    accessor mockSelectionContainer: HTMLDivElement;
    accessor overlayMask: HTMLDivElement;
    accessor popoverContainer: HTMLDivElement;
    accessor targetInlineRange: InlineRange;
    accessor textInput: HTMLInputElement | null;
    accessor type: 'create' | 'edit';
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=link-popup.d.ts.map