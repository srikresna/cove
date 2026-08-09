import { LitElement } from 'lit';
import { NoteTool, type NoteToolOption } from '../note-tool.js';
declare const EdgelessNoteSeniorButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessNoteSeniorButton extends EdgelessNoteSeniorButton_base {
    static styles: import("lit").CSSResult;
    private readonly _noteBg$;
    private readonly _states;
    enableActiveBackground: boolean;
    type: typeof NoteTool;
    private _toggleNoteMenu;
    render(): import("lit-html").TemplateResult<1>;
    accessor childFlavour: NoteToolOption['childFlavour'];
    accessor childType: string;
    accessor tip: string;
}
export {};
//# sourceMappingURL=note-senior-button.d.ts.map