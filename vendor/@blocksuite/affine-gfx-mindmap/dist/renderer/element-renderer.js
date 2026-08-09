import { ElementRendererExtension, } from '@blocksuite/affine-block-surface';
import { connector as renderConnector, ConnectorPathGenerator, } from '@blocksuite/affine-gfx-connector';
export const mindmap = (model, ctx, matrix, renderer, rc, bound) => {
    const dx = model.x - bound.x;
    const dy = model.y - bound.y;
    matrix = matrix.translate(-dx, -dy);
    const mindmapOpacity = model.opacity;
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
            const dx = connector.x - bound.x;
            const dy = connector.y - bound.y;
            const origin = ctx.globalAlpha;
            const shouldSetGlobalAlpha = origin !== connector.opacity * mindmapOpacity;
            if (shouldSetGlobalAlpha) {
                ctx.globalAlpha = connector.opacity * mindmapOpacity;
            }
            renderConnector(connector, ctx, matrix.translate(dx, dy), renderer, rc, 
            // NOTE: should we add this?
            bound);
            if (shouldSetGlobalAlpha) {
                ctx.globalAlpha = origin;
            }
        });
        if (node.detail.collapsed) {
            return;
        }
        else {
            node.children.forEach(traverse);
        }
    };
    model.tree && traverse(model.tree);
};
export const MindmapElementRendererExtension = ElementRendererExtension('mindmap', mindmap);
