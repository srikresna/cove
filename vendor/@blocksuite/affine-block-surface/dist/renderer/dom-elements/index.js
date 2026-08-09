import { createIdentifier } from '@blocksuite/global/di';
/**
 * Creates a unique identifier for a DomElementRenderer based on the element type.
 * @param type - The type of the surface element (e.g., 'shape', 'text').
 * @returns A ServiceIdentifier for the DI container.
 */
export const DomElementRendererIdentifier = (type) => createIdentifier(`affine.surface.dom-element-renderer.${type}`);
