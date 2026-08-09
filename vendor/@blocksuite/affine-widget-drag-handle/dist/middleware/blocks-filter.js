import { assertType } from '@blocksuite/global/utils';
import { GfxController, isGfxGroupCompatibleModel, } from '@blocksuite/std/gfx';
/**
 * Used to filter out gfx elements that are not selected
 * @param ids
 * @param std
 * @returns
 */
export const gfxBlocksFilter = (ids, std) => {
    const selectedIds = new Set();
    const store = std.store;
    const surface = store.getBlocksByFlavour('affine:surface')[0]
        .model;
    const idsToCheck = ids.slice();
    const gfx = std.get(GfxController);
    for (const id of idsToCheck) {
        const blockOrElem = store.getBlock(id)?.model ?? surface.getElementById(id);
        if (!blockOrElem)
            continue;
        if (isGfxGroupCompatibleModel(blockOrElem)) {
            idsToCheck.push(...blockOrElem.childIds);
        }
        selectedIds.add(id);
    }
    return ({ slots, transformerConfigs }) => {
        const beforeExportSubscription = slots.beforeExport.subscribe(payload => {
            if (payload.type !== 'block') {
                return;
            }
            if (payload.model.flavour === 'affine:surface') {
                transformerConfigs.set('selectedElements', selectedIds);
                payload.model.children = payload.model.children.filter(model => selectedIds.has(model.id));
                return;
            }
        });
        const afterExportSubscription = slots.afterExport.subscribe(payload => {
            if (payload.type !== 'block') {
                return;
            }
            if (payload.model.flavour === 'affine:surface') {
                const { snapshot } = payload;
                const elementsMap = snapshot.props.elements;
                Object.entries(elementsMap).forEach(([elementId, val]) => {
                    if (val.type === 'connector') {
                        assertType(val);
                        const connectorElem = gfx.getElementById(elementId);
                        if (!connectorElem) {
                            delete elementsMap[elementId];
                            return;
                        }
                        // should be deleted during the import process
                        val.xywh = connectorElem.xywh;
                        ['source', 'target'].forEach(key => {
                            const endpoint = val[key];
                            if (endpoint.id && !selectedIds.has(endpoint.id)) {
                                const endElem = gfx.getElementById(endpoint.id);
                                if (!endElem) {
                                    delete elementsMap[elementId];
                                    return;
                                }
                                const endElemBound = endElem.elementBound;
                                val[key] = {
                                    position: endElemBound.getRelativePoint(endpoint.position ?? [0.5, 0.5]),
                                };
                            }
                        });
                    }
                });
            }
        });
        return () => {
            beforeExportSubscription.unsubscribe();
            afterExportSubscription.unsubscribe();
        };
    };
};
