import type { SerializedXYWH } from '@blocksuite/global/gfx';
import { GfxLocalElementModel, GfxPrimitiveElementModel } from '../gfx/index.js';
export declare class TestShapeElement extends GfxPrimitiveElementModel {
    get type(): string;
    accessor rotate: number;
    accessor xywh: SerializedXYWH;
    accessor shapeType: 'rect' | 'triangle';
}
export declare class TestLocalElement extends GfxLocalElementModel {
    type: string;
}
//# sourceMappingURL=test-gfx-element.d.ts.map