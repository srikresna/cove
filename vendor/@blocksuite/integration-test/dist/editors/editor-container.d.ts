import type { DocMode } from '@blocksuite/affine/model';
import { BlockStdScope, ShadowlessElement } from '@blocksuite/affine/std';
import { type BlockModel, type ExtensionType, type Store } from '@blocksuite/affine/store';
declare const TestAffineEditorContainer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TestAffineEditorContainer extends TestAffineEditorContainer_base {
    static styles: import("lit").CSSResult;
    private readonly _doc;
    private readonly _edgelessSpecs;
    private readonly _mode;
    private readonly _pageSpecs;
    private readonly _specs;
    private readonly _std;
    private readonly _editorTemplate;
    get doc(): Store;
    set doc(doc: Store);
    set edgelessSpecs(specs: ExtensionType[]);
    get edgelessSpecs(): ExtensionType[];
    get host(): import("@blocksuite/affine/std").EditorHost | null;
    get mode(): DocMode;
    set mode(mode: DocMode);
    set pageSpecs(specs: ExtensionType[]);
    get pageSpecs(): ExtensionType[];
    get rootModel(): BlockModel;
    get std(): BlockStdScope;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    switchEditor(mode: DocMode): void;
    accessor autofocus: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-editor-container': TestAffineEditorContainer;
    }
}
export {};
//# sourceMappingURL=editor-container.d.ts.map