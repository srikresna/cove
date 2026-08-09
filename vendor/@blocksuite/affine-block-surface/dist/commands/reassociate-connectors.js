import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
/**
 * Re-associate bindings for block that have been converted.
 *
 * @param oldId - the old block id
 * @param newId - the new block id
 */
export const reassociateConnectorsCommand = (ctx, next) => {
    const { oldId, newId } = ctx;
    const gfx = ctx.std.get(GfxControllerIdentifier);
    if (!oldId || !newId || !gfx.surface) {
        next();
        return;
    }
    const surface = gfx.surface;
    const connectors = surface.getConnectors(oldId);
    for (const { id, source, target } of connectors) {
        if (source.id === oldId) {
            surface.updateElement(id, {
                source: {
                    ...source,
                    id: newId,
                },
            });
            continue;
        }
        if (target.id === oldId) {
            surface.updateElement(id, {
                target: {
                    ...target,
                    id: newId,
                },
            });
        }
    }
    next();
};
