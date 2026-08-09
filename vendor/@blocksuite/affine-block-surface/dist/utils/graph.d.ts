import type { Bound, IVec, IVec3 } from '@blocksuite/global/gfx';
export declare class Graph<V extends IVec | IVec3 = IVec> {
    private readonly points;
    private readonly blocks;
    private readonly expandedBlocks;
    private readonly excludedPoints;
    private readonly _xMap;
    private readonly _yMap;
    constructor(points: V[], blocks?: Bound[], expandedBlocks?: Bound[], excludedPoints?: V[]);
    private _canSkipBlock;
    private _isBlock;
    neighbors(curPoint: V): V[];
}
//# sourceMappingURL=graph.d.ts.map