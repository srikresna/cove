import { DomElementRendererExtension } from '@blocksuite/affine-block-surface';
import { connectorBaseDomRenderer, ConnectorPathGenerator, } from '@blocksuite/affine-gfx-connector';
export const MindmapDomRendererExtension = DomElementRendererExtension('mindmap', (model, domElement, renderer) => {
    const bound = model.elementBound;
    const { zoom } = renderer.viewport;
    // Set element size and position
    domElement.style.width = `${bound.w * zoom}px`;
    domElement.style.height = `${bound.h * zoom}px`;
    domElement.style.overflow = 'visible';
    domElement.style.pointerEvents = 'none';
    const newChildren = [];
    const traverse = (node) => {
        const connectors = model.getConnectors(node);
        if (!connectors)
            return;
        connectors.reverse().forEach(result => {
            const { connector, outdated } = result;
            const elementGetter = (id) => model.surface.getElementById(id) ??
                model.surface.store.getModelById(id);
            if (outdated) {
                ConnectorPathGenerator.updatePath(connector, null, elementGetter);
            }
            const connectorContainer = document.createElement('div');
            connectorContainer.style.position = 'absolute';
            connectorContainer.style.transformOrigin = 'top left';
            const geometricStyles = {
                left: `${(connector.x - bound.x) * zoom}px`,
                top: `${(connector.y - bound.y) * zoom}px`,
            };
            const opacityStyle = { opacity: node.element.opacity };
            Object.assign(connectorContainer.style, geometricStyles, opacityStyle);
            connectorBaseDomRenderer(connector, connectorContainer, renderer);
            newChildren.push(connectorContainer);
        });
        if (node.detail.collapsed) {
            return;
        }
        else {
            node.children.forEach(traverse);
        }
    };
    model.tree && traverse(model.tree);
    domElement.replaceChildren(...newChildren);
});
