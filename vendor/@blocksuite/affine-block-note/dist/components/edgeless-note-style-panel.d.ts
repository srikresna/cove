import { NoteBlockModel } from '@blocksuite/affine-model';
import { BlockStdScope } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EdgelessNoteStylePanel_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessNoteStylePanel extends EdgelessNoteStylePanel_base {
    accessor notes: NoteBlockModel[];
    accessor std: BlockStdScope;
    accessor tabType: 'style' | 'customColor';
    accessor container: HTMLDivElement;
    static styles: import("lit").CSSResult;
    private _styleChanged;
    private _beforeChange;
    private get _theme();
    private get _background();
    private get _originalBackground();
    private get _shadow();
    private get _borderSize();
    private get _borderStyle();
    private get _borderRadius();
    private readonly _switchToCustomColorTab;
    private readonly _switchToStyleTab;
    private readonly _selectColor;
    private readonly _pickColor;
    private readonly _selectShadow;
    private readonly _selectBorder;
    private readonly _selectBorderRadius;
    private _renderStylePanel;
    private _renderCustomColorPanel;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-style-panel': EdgelessNoteStylePanel;
    }
}
export {};
//# sourceMappingURL=edgeless-note-style-panel.d.ts.map