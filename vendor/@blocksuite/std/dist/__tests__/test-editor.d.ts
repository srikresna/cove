import type { ExtensionType, Store } from '@blocksuite/store';
import { BlockStdScope } from '../scope/index.js';
import { ShadowlessElement } from '../view/index.js';
declare const TestEditorContainer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TestEditorContainer extends TestEditorContainer_base {
    private _std;
    get std(): BlockStdScope;
    connectedCallback(): void;
    protected render(): import("lit-html").TemplateResult<1>;
    accessor doc: Store;
    accessor specs: ExtensionType[];
}
export {};
//# sourceMappingURL=test-editor.d.ts.map