import { DomElementRendererIdentifier, } from '../renderer/dom-elements/index.js';
/**
 * Creates an extension for registering a DomElementRenderer for a specific element type.
 *
 * @param elementType The type of the surface element (e.g., 'shape', 'text') for which this renderer is.
 * @param implementation The DomElementRenderer function that handles rendering for this element type.
 * @returns An ExtensionType object that can be used to set up the renderer in the DI container.
 */
export const DomElementRendererExtension = (elementType, implementation) => {
    return {
        setup: di => {
            di.addValue(DomElementRendererIdentifier(elementType), implementation);
        },
    };
};
