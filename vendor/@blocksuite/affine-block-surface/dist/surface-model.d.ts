import type { ConnectorElementModel, SurfaceElementModelMap } from '@blocksuite/affine-model';
import type { SurfaceBlockProps } from '@blocksuite/std/gfx';
import { SurfaceBlockModel as BaseSurfaceModel } from '@blocksuite/std/gfx';
import { SurfaceBlockTransformer } from './surface-transformer.js';
export declare const SurfaceBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<SurfaceBlockProps>;
        flavour: "affine:surface";
    } & {
        version: number;
        role: "hub";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => SurfaceBlockTransformer) | undefined;
};
export declare const SurfaceBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class SurfaceBlockModel extends BaseSurfaceModel {
    private readonly _disposables;
    private readonly _connectorIdsByEndpoint;
    private readonly _connectorIndexDisposables;
    private readonly _connectorEndpoints;
    private _addConnectorEndpoint;
    private _isConnectorModel;
    private _removeConnectorEndpoint;
    private _removeConnectorFromIndex;
    private _rebuildConnectorIndex;
    private _setConnectorEndpoints;
    _init(): void;
    getConnectors(id: string): ConnectorElementModel[];
    getElementsByType<K extends keyof SurfaceElementModelMap>(type: K): SurfaceElementModelMap[K][];
}
//# sourceMappingURL=surface-model.d.ts.map