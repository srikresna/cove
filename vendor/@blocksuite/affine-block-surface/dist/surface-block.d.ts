import { Bound } from '@blocksuite/global/gfx';
import type { EditorHost, SurfaceSelection } from '@blocksuite/std';
import { BlockComponent } from '@blocksuite/std';
import { type Viewport } from '@blocksuite/std/gfx';
import type { Subject } from 'rxjs';
import { ConnectorElementModel } from './element-model/index.js';
import { CanvasRenderer } from './renderer/canvas-renderer.js';
import { DomRenderer } from './renderer/dom-renderer.js';
import type { SurfaceBlockModel } from './surface-model.js';
export interface SurfaceContext {
    viewport: Viewport;
    host: EditorHost;
    selection: {
        selectedIds: string[];
        slots: {
            updated: Subject<SurfaceSelection[]>;
        };
    };
}
export declare class SurfaceBlockComponent extends BlockComponent<SurfaceBlockModel> {
    static isConnector: (element: unknown) => element is ConnectorElementModel;
    static styles: import("lit").CSSResult;
    private _cachedViewport;
    private readonly _initThemeObserver;
    private _lastTime;
    private _renderer;
    fitToViewport: (bound: Bound) => void;
    refresh: () => void;
    private get _gfx();
    get renderer(): DomRenderer | CanvasRenderer;
    private _initOverlays;
    private _initRenderer;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _surfaceContainer;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-surface': SurfaceBlockComponent;
    }
}
//# sourceMappingURL=surface-block.d.ts.map