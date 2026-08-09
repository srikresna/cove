import { type Bound, type IVec3 } from '@blocksuite/global/gfx';
export declare class AStarRunner {
    private readonly _sp;
    private readonly _ep;
    private readonly _originalSp;
    private _originalEp;
    private readonly _cameFrom;
    private _complete;
    private readonly _costSoFar;
    private _current;
    private readonly _diagonalCount;
    private _frontier;
    private readonly _graph;
    private readonly _pointPriority;
    get path(): IVec3[];
    constructor(points: IVec3[], _sp: IVec3, _ep: IVec3, _originalSp: IVec3, _originalEp: IVec3, blocks?: Bound[], expandBlocks?: Bound[]);
    private _init;
    private _neighbors;
    reset(): void;
    run(): void;
    step(): void;
}
//# sourceMappingURL=a-star.d.ts.map