import { EdgelessDraggableElementController } from '@blocksuite/affine-widget-edgeless-toolbar';
import type { BlockComponent } from '@blocksuite/std';
import { LitElement } from 'lit';
import type { Template } from './template-type.js';
declare const EdgelessTemplatePanel_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessTemplatePanel extends EdgelessTemplatePanel_base {
    static styles: import("lit").CSSResult;
    static templates: {
        list: (category: string) => Promise<Template[]>;
        categories: () => Promise<string[]>;
        search: (keyword: string, cateName?: string) => Promise<Template[]>;
        extend(manager: import("./template-type.js").TemplateManager): void;
    };
    private _fetchJob;
    draggableController: EdgelessDraggableElementController<Template>;
    private _closePanel;
    private _fetch;
    private _getLocalSelectedCategory;
    private _initCategory;
    private _initDragController;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    private _insertTemplate;
    private _updateSearchKeyword;
    private _updateTemplates;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _categories;
    private accessor _currentCategory;
    private accessor _loading;
    private accessor _loadingTemplate;
    private accessor _searchKeyword;
    private accessor _templates;
    accessor edgeless: BlockComponent;
    accessor isDragging: boolean;
}
export {};
//# sourceMappingURL=template-panel.d.ts.map