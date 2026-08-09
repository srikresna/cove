import { LitElement } from 'lit';
import { NoteTool, type NoteToolOption } from '../note-tool.js';
declare const EdgelessNoteToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").QuickToolMixinClass>;
export declare class EdgelessNoteToolButton extends EdgelessNoteToolButton_base {
    static styles: import("lit").CSSResult;
    private _noteMenu;
    private readonly _states;
    type: typeof NoteTool;
    private _disposeMenu;
    private _toggleNoteMenu;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor childFlavour: NoteToolOption['childFlavour'];
    accessor childType: string;
    accessor tip: string;
}
export {};
//# sourceMappingURL=note-tool-button.d.ts.map