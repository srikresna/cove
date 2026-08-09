import type { EditorIconButton } from '@blocksuite/affine-components/toolbar';
import type { ReferenceInfo } from '@blocksuite/affine-model';
import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import type { InlineEditor, InlineRange } from '@blocksuite/std/inline';
declare const ReferencePopup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class ReferencePopup extends ReferencePopup_base {
    static styles: import("lit").CSSResult;
    private readonly _onSave;
    private readonly _updateTitle;
    private _onKeydown;
    private _onReset;
    private _setTitle;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    updated(): void;
    accessor abortController: AbortController;
    accessor docTitle: string;
    accessor inlineEditor: InlineEditor<AffineTextAttributes>;
    accessor inlineRange: InlineRange;
    accessor inputElement: HTMLInputElement;
    accessor overlayMask: HTMLDivElement;
    accessor popoverContainer: HTMLDivElement;
    accessor referenceInfo: ReferenceInfo;
    accessor saveButton: EditorIconButton;
    accessor std: BlockStdScope;
    accessor title$: import("@preact/signals-core").Signal<string>;
}
export {};
//# sourceMappingURL=reference-popup.d.ts.map