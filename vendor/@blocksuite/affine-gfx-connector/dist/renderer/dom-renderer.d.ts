import { type DomRenderer } from '@blocksuite/affine-block-surface';
import { type ConnectorElementModel, type LocalConnectorElementModel } from '@blocksuite/affine-model';
/**
 * Renders a ConnectorElementModel to a given HTMLElement using DOM/SVG.
 * This function is intended to be registered via the DomElementRendererExtension.
 *
 * @param model - The connector element model containing rendering properties.
 * @param element - The HTMLElement to apply the connector's styles to.
 * @param renderer - The main DOMRenderer instance, providing access to viewport and color utilities.
 */
export declare const connectorBaseDomRenderer: (model: ConnectorElementModel | LocalConnectorElementModel, element: HTMLElement, renderer: DomRenderer) => void;
export declare const connectorDomRenderer: (model: ConnectorElementModel, element: HTMLElement, renderer: DomRenderer) => void;
/**
 * Extension to register the DOM-based renderer for 'connector' elements.
 */
export declare const ConnectorDomRendererExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=dom-renderer.d.ts.map