import type { SurfaceElementModel } from '../../element-model/base.js';
import type { DomRenderer } from '../dom-renderer.js';
/**
 * Creates a unique identifier for a DomElementRenderer based on the element type.
 * @param type - The type of the surface element (e.g., 'shape', 'text').
 * @returns A ServiceIdentifier for the DI container.
 */
export declare const DomElementRendererIdentifier: (type: string) => import("@blocksuite/global/di").ServiceIdentifier<DomElementRenderer<SurfaceElementModel<import("@blocksuite/std/gfx").BaseElementProps>>> & (<U extends DomElementRenderer<SurfaceElementModel<import("@blocksuite/std/gfx").BaseElementProps>> = DomElementRenderer<SurfaceElementModel<import("@blocksuite/std/gfx").BaseElementProps>>>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
/**
 * Defines the signature for a DOM element renderer function.
 * Such a function is responsible for rendering a specific type of SurfaceElementModel
 * into a given HTMLElement.
 *
 * @template T - The specific type of SurfaceElementModel this renderer handles.
 * @param elementModel - The model of the element to render.
 * @param domElement - The HTMLElement into which the element should be rendered.
 *                     Basic properties like position and size (if not using placeholder)
 *                     are expected to be set by the main DOMRenderer before this function is called.
 * @param renderer - The instance of the main DOMRenderer, providing access to shared
 *                   utilities like color providers and viewport information.
 */
export type DomElementRenderer<T extends SurfaceElementModel = SurfaceElementModel> = (elementModel: T, domElement: HTMLElement, renderer: DomRenderer) => void;
//# sourceMappingURL=index.d.ts.map