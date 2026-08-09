import { surfaceMiddlewareExtension, } from '@blocksuite/affine-block-surface';
import { ConnectorPathGenerator } from './connector-manager';
export const connectorWatcher = (surface) => {
    const hasElementById = (id) => surface.hasElementById(id) || surface.store.hasBlock(id);
    const elementGetter = (id) => surface.getElementById(id) ?? surface.store.getModelById(id);
    const updateConnectorPath = (connector) => {
        if (((connector.source?.id && hasElementById(connector.source.id)) ||
            (!connector.source?.id && connector.source?.position)) &&
            ((connector.target?.id && hasElementById(connector.target.id)) ||
                (!connector.target?.id && connector.target?.position))) {
            ConnectorPathGenerator.updatePath(connector, null, elementGetter);
        }
    };
    const pendingList = new Set();
    let pendingFlag = false;
    const addToUpdateList = (connector) => {
        pendingList.add(connector);
        if (!pendingFlag) {
            pendingFlag = true;
            queueMicrotask(() => {
                pendingList.forEach(updateConnectorPath);
                pendingList.clear();
                pendingFlag = false;
            });
        }
    };
    const disposables = [
        surface.elementAdded.subscribe(({ id }) => {
            const element = elementGetter(id);
            if (!element)
                return;
            if ('type' in element && element.type === 'connector') {
                addToUpdateList(element);
            }
            else {
                surface.getConnectors(id).forEach(addToUpdateList);
            }
        }),
        surface.elementUpdated.subscribe(({ id, props }) => {
            const element = elementGetter(id);
            if (props['xywh'] || props['rotate']) {
                surface.getConnectors(id).forEach(addToUpdateList);
            }
            if ('type' in element &&
                element.type === 'connector' &&
                (props['mode'] !== undefined || props['target'] || props['source'])) {
                addToUpdateList(element);
            }
        }),
        surface.store.slots.blockUpdated.subscribe(payload => {
            if (payload.type === 'add' ||
                (payload.type === 'update' && payload.props.key === 'xywh')) {
                surface.getConnectors(payload.id).forEach(addToUpdateList);
            }
        }),
    ];
    surface
        .getElementsByType('connector')
        .forEach(connector => updateConnectorPath(connector));
    return () => {
        pendingFlag = false;
        pendingList.clear();
        disposables.forEach(d => d.unsubscribe());
    };
};
export const connectorWatcherExtension = surfaceMiddlewareExtension('connector-watcher', connectorWatcher);
