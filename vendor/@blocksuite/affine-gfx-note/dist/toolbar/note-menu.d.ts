import type { NoteChildrenFlavour } from '@blocksuite/affine-shared/types';
import { LitElement } from 'lit';
import { NoteTool, type NoteToolOption } from '../note-tool.js';
declare const EdgelessNoteMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessNoteMenu extends EdgelessNoteMenu_base {
    static styles: import("lit").CSSResult;
    type: typeof NoteTool;
    private _addImages;
    private _onHandleLinkButtonClick;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _imageLoading;
    accessor childFlavour: NoteChildrenFlavour;
    accessor childType: string | null;
    accessor onChange: (props: Partial<{
        childFlavour: NoteToolOption['childFlavour'];
        childType: string | null;
        tip: string;
    }>) => void;
    accessor tip: string;
}
export {};
//# sourceMappingURL=note-menu.d.ts.map