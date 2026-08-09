import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import { type InlineEditor } from '@blocksuite/std/inline';
import type { DeltaInsert } from '@blocksuite/store';
import { type PropertyValues } from 'lit';
declare const AffineLatexNode_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineLatexNode extends AffineLatexNode_base {
    static styles: import("lit").CSSResult;
    private _editorAbortController;
    private _isEditorOpen;
    readonly latex$: import("@preact/signals-core").Signal<string>;
    readonly latexEditorSignal: import("@preact/signals-core").Signal<string>;
    get deltaLatex(): string;
    get latexContainer(): HTMLElement | null;
    connectedCallback(): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1>;
    toggleEditor(): void;
    get readonly(): boolean;
    accessor delta: DeltaInsert<AffineTextAttributes>;
    accessor editor: InlineEditor<AffineTextAttributes>;
    accessor endOffset: number;
    accessor selected: boolean;
    accessor startOffset: number;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=latex-node.d.ts.map