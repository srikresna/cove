import type { DomRenderer } from '@blocksuite/affine-block-surface';
import type { ShapeElementModel } from '@blocksuite/affine-model';
/**
 * Renders a ShapeElementModel to a given HTMLElement using DOM properties.
 * This function is intended to be registered via the DomElementRendererExtension.
 *
 * @param model - The shape element model containing rendering properties.
 * @param element - The HTMLElement to apply the shape's styles to.
 * @param renderer - The main DOMRenderer instance, providing access to viewport and color utilities.
 */
export declare const shapeDomRenderer: (model: ShapeElementModel, element: HTMLElement, renderer: DomRenderer) => void;
//# sourceMappingURL=index.d.ts.map