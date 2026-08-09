import '@toeverything/theme/style.css';
import '@toeverything/theme/fonts.css';
import type { DocMode } from '@blocksuite/affine/model';
import { type ViewportTurboRendererExtension } from '@blocksuite/affine-gfx-turbo-renderer';
import type { ExtensionType, Store, Transformer } from '@blocksuite/store';
import { TestWorkspace } from '@blocksuite/store/test';
import { TestAffineEditorContainer } from '../../index.js';
export declare function getRenderer(): ViewportTurboRendererExtension;
export declare function createPainterWorker(): Worker;
type SetupEditorOptions = {
    extensions?: ExtensionType[];
    enableDomRenderer?: boolean;
};
export declare function setupEditor(mode?: DocMode, extensionsInput?: ExtensionType[], optionsInput?: SetupEditorOptions): Promise<() => Promise<void>>;
export declare function cleanup(): Promise<void>;
declare global {
    const editor: TestAffineEditorContainer;
    const doc: Store;
    const collection: TestWorkspace;
    const job: Transformer;
    interface Window {
        editor: TestAffineEditorContainer;
        doc: Store;
        job: Transformer;
        collection: TestWorkspace;
        renderer: ViewportTurboRendererExtension;
    }
}
export {};
//# sourceMappingURL=setup.d.ts.map