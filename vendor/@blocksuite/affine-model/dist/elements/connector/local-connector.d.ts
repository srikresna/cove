import type { PointLocation } from '@blocksuite/global/gfx';
import { GfxLocalElementModel } from '@blocksuite/std/gfx';
import { ConnectorMode, type PointStyle, StrokeStyle } from '../../consts/index';
import { type Color } from '../../themes/index';
import type { Connection } from './connector.js';
export declare class LocalConnectorElementModel extends GfxLocalElementModel {
    private _path;
    absolutePath: PointLocation[];
    frontEndpointStyle: PointStyle;
    mode: ConnectorMode;
    rearEndpointStyle: PointStyle;
    rough?: boolean;
    roughness: number;
    source: Connection;
    stroke: Color;
    strokeStyle: StrokeStyle;
    strokeWidth: number;
    target: Connection;
    updatingPath: boolean;
    get path(): PointLocation[];
    set path(value: PointLocation[]);
    get type(): string;
}
//# sourceMappingURL=local-connector.d.ts.map