import { type DatabaseBlockModel } from '@blocksuite/affine-model';
import type { DetailSlotProps, SingleView } from '@blocksuite/data-view';
import { type EditorHost, ShadowlessElement } from '@blocksuite/std';
declare const NoteRenderer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class NoteRenderer extends NoteRenderer_base implements DetailSlotProps {
    static styles: import("lit").CSSResult;
    accessor rowId: string;
    rowText$: import("@preact/signals-core").ReadonlySignal<import("@blocksuite/store").Text<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }> | undefined>;
    allowCreateDoc$: import("@preact/signals-core").ReadonlySignal<boolean>;
    get databaseBlock(): DatabaseBlockModel;
    addNote(): void;
    protected render(): unknown;
    renderNote(): import("lit-html").TemplateResult<1> | undefined;
    accessor host: EditorHost;
    accessor model: DatabaseBlockModel;
    accessor openDoc: (docId: string) => void;
    accessor view: SingleView;
}
export {};
//# sourceMappingURL=note-renderer.d.ts.map