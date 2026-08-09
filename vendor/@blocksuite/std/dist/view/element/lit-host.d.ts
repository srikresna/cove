import { type BlockModel, Store, type StoreSelectionExtension } from '@blocksuite/store';
import { nothing, type TemplateResult } from 'lit';
import type { CommandManager } from '../../command/index.js';
import type { UIEventDispatcher } from '../../event/index.js';
import type { RangeManager } from '../../inline/index.js';
import type { BlockStdScope } from '../../scope/std-scope.js';
import type { ViewStore } from '../view-store.js';
import { ShadowlessElement } from './shadowless-element.js';
export declare const storeContext: {
    __context__: Store;
};
export declare const stdContext: {
    __context__: BlockStdScope;
};
declare const EditorHost_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EditorHost extends EditorHost_base {
    static styles: import("lit").CSSResult;
    private readonly _renderModel;
    renderChildren: (model: BlockModel, filter?: (model: BlockModel) => boolean) => TemplateResult;
    get command(): CommandManager;
    get event(): UIEventDispatcher;
    get range(): RangeManager;
    get selection(): StoreSelectionExtension;
    get view(): ViewStore;
    connectedCallback(): void;
    disconnectedCallback(): void;
    getUpdateComplete(): Promise<boolean>;
    render(): TemplateResult | typeof nothing;
    accessor store: Store;
    accessor std: BlockStdScope;
}
declare global {
    interface HTMLElementTagNameMap {
        'editor-host': EditorHost;
    }
}
export {};
//# sourceMappingURL=lit-host.d.ts.map