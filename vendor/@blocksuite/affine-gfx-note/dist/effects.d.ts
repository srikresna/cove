import { NoteDisplayModePanel } from './components/note-display-mode-panel';
import { EdgelessNoteShadowPanel } from './components/note-shadow-panel';
import { EdgelessNoteMenu } from './toolbar/note-menu';
import { EdgelessNoteSeniorButton } from './toolbar/note-senior-button';
import { EdgelessNoteToolButton } from './toolbar/note-tool-button';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-tool-button': EdgelessNoteToolButton;
        'edgeless-note-menu': EdgelessNoteMenu;
        'edgeless-note-senior-button': EdgelessNoteSeniorButton;
        'edgeless-note-shadow-panel': EdgelessNoteShadowPanel;
        'note-display-mode-panel': NoteDisplayModePanel;
    }
}
//# sourceMappingURL=effects.d.ts.map