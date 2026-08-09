import { type Color, ColorScheme } from '@blocksuite/affine-model';
import { type BlockStdScope } from '@blocksuite/std';
import type { GridManager, LayerManager, SurfaceBlockModel, Viewport } from '@blocksuite/std/gfx';
import { Subject } from 'rxjs';
import type { Overlay } from './overlay.js';
type EnvProvider = {
    generateColorProperty: (color: Color, fallback?: Color) => string;
    getColorScheme: () => ColorScheme;
    getColorValue: (color: Color, fallback?: Color, real?: boolean) => string;
    getPropertyValue: (property: string) => string;
    selectedElements?: () => string[];
};
type RendererOptions = {
    std: BlockStdScope;
    viewport: Viewport;
    layerManager: LayerManager;
    provider?: Partial<EnvProvider>;
    gridManager: GridManager;
    surfaceModel: SurfaceBlockModel;
};
declare const UpdateType: {
    readonly ELEMENT_ADDED: "element-added";
    readonly ELEMENT_REMOVED: "element-removed";
    readonly ELEMENT_UPDATED: "element-updated";
    readonly VIEWPORT_CHANGED: "viewport-changed";
    readonly SIZE_CHANGED: "size-changed";
    readonly ZOOM_STATE_CHANGED: "zoom-state-changed";
};
type UpdateType = (typeof UpdateType)[keyof typeof UpdateType];
/**
 * @class DomRenderer
 * Renders surface elements directly to the DOM using HTML elements and CSS.
 *
 * This renderer supports an extension mechanism to handle different types of surface elements.
 * To add rendering support for a new element type (e.g., 'my-custom-element'), follow these steps:
 *
 * 1.  **Define the Renderer Function**:
 *     Create a function that implements the rendering logic for your element.
 *     This function will receive the element's model, the target HTMLElement, and the DomRenderer instance.
 *     Signature: `(model: MyCustomElementModel, domElement: HTMLElement, renderer: DomRenderer) => void;`
 *     Example: `shapeDomRenderer` in `blocksuite/affine/gfx/shape/src/element-renderer/shape-dom/index.ts`.
 *     In this function, you'll apply styles and attributes to the `domElement` based on the `model`.
 *
 * 2.  **Create the Renderer Extension**:
 *     Create a new file (e.g., `my-custom-element-dom-renderer.extension.ts`).
 *     Import `DomElementRendererExtension` (e.g., from `@blocksuite/affine-block-surface` or its source location
 *     `blocksuite/affine/blocks/surface/src/extensions/dom-element-renderer.ts`).
 *     Import your renderer function (from step 1).
 *     Use the factory to create your extension:
 *     `export const MyCustomElementDomRendererExtension = DomElementRendererExtension('my-custom-element', myCustomElementRendererFn);`
 *     Example: `ShapeDomRendererExtension` in `blocksuite/affine/gfx/shape/src/element-renderer/shape-dom.ts`.
 *
 * 3.  **Register the Extension**:
 *     In your application setup where BlockSuite services and view extensions are registered (e.g., a `ViewExtensionProvider`
 *     or a central DI configuration place), import your new extension (from step 2) and register it with the
 *     dependency injection container.
 *     Example: `context.register(MyCustomElementDomRendererExtension);`
 *     As seen with `ShapeDomRendererExtension` being registered in `blocksuite/affine/gfx/shape/src/view.ts`.
 *
 * 4.  **Core Infrastructure (Provided by DomRenderer System)**:
 *     -   `DomElementRenderer` (type): The function signature for renderers, defined in
 *         `blocksuite/affine/blocks/surface/src/renderer/dom-elements/index.ts`.
 *     -   `DomElementRendererIdentifier` (function): Creates unique service identifiers for DI,
 *         used by `DomRenderer` to look up specific renderers. Defined in the same file.
 *     -   `DomElementRendererExtension` (factory): A helper to create extension objects for easy registration.
 *         (e.g., from `@blocksuite/affine-block-surface` or its source).
 *     -   `DomRenderer._renderElement()`: This method automatically looks up the registered renderer using
 *         `DomElementRendererIdentifier(elementType)` and calls it if found.
 *
 * 5.  **Ensure Exports**:
 *     -   The `DomRenderer` class itself should be accessible (e.g., exported from `@blocksuite/affine/blocks/surface`).
 *     -   The `DomElementRendererExtension` factory should be accessible.
 *
 * By following these steps, `DomRenderer` will automatically pick up and use your custom rendering logic
 * when it encounters elements of 'my-custom-element' type.
 */
export declare class DomRenderer {
    private _container;
    private readonly _disposables;
    private readonly _turboEnabled;
    private readonly _overlays;
    private _refreshRafId;
    private _sizeUpdatedRafId;
    private readonly _updateState;
    private readonly _pendingElements;
    private _lastViewportBounds;
    private _lastZoom;
    private _lastUsePlaceholder;
    rootElement: HTMLElement;
    private readonly _elementsMap;
    std: BlockStdScope;
    grid: GridManager;
    layerManager: LayerManager;
    provider: Partial<EnvProvider>;
    private readonly _surfaceModel;
    usePlaceholder: boolean;
    viewport: Viewport;
    elementsUpdated: Subject<{
        elements: HTMLElement[];
        added: HTMLElement[];
        removed: HTMLElement[];
    }>;
    constructor(options: RendererOptions);
    private _initViewport;
    private _resetSize;
    private _renderElement;
    private _renderOrUpdatePlaceholder;
    private _renderOrUpdateFullElement;
    private _render;
    private _watchSurface;
    addOverlay: (overlay: Overlay) => void;
    attach: (container: HTMLElement) => void;
    dispose: () => void;
    generateColorProperty: (color: Color, fallback?: Color) => string;
    getColorScheme: () => ColorScheme;
    getColorValue: (color: Color, fallback?: Color, real?: boolean) => string;
    getPropertyValue: (property: string) => string;
    refresh: () => void;
    removeOverlay: (overlay: Overlay) => void;
    /**
     * Mark a specific element as dirty for incremental updates
     * @param elementId - The ID of the element to mark as dirty
     * @param updateType - The type of update (optional, defaults to ELEMENT_UPDATED)
     */
    markElementDirty: (elementId: string, updateType?: UpdateType) => void;
    /**
     * Force a full re-render of all elements
     */
    forceFullRender: () => void;
    private _markElementDirty;
    private _markViewportDirty;
    private _markSizeDirty;
    private _markUsePlaceholderDirty;
    private _clearUpdateState;
    private _isViewportChanged;
    private _isUsePlaceholderChanged;
    private _elementInViewport;
    private _getPendingElementsInViewport;
    private _getElementsInViewport;
    private _updateLastState;
    private _renderIncremental;
    private _renderFull;
}
export {};
//# sourceMappingURL=dom-renderer.d.ts.map