import { NoteDisplayMode } from '@blocksuite/affine-model';
import { ShadowlessElement } from '@blocksuite/std';
export declare class EdgelessNoteDisplayModeDropdownMenu extends ShadowlessElement {
    get mode(): "Both" | "Edgeless" | "Page";
    select(detail: NoteDisplayMode): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor displayMode: NoteDisplayMode;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-display-mode-dropdown-menu': EdgelessNoteDisplayModeDropdownMenu;
    }
}
//# sourceMappingURL=edgeless-note-display-mode-dropdown-menu.d.ts.map