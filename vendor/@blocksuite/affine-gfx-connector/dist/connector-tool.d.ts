import { ConnectorMode } from '@blocksuite/affine-model';
import type { IVec } from '@blocksuite/global/gfx';
import type { PointerEventState } from '@blocksuite/std';
import { BaseTool, type GfxModel } from '@blocksuite/std/gfx';
export type ConnectorToolOptions = {
    mode: ConnectorMode;
};
export declare class ConnectorTool extends BaseTool<ConnectorToolOptions> {
    static toolName: string;
    private _allowCancel;
    private _connector;
    private _mode;
    private _source;
    private _sourceBounds;
    private _sourceLocations;
    private _startPoint;
    private get _overlay();
    private _createConnector;
    click(): void;
    deactivate(): void;
    dragEnd(): void;
    dragMove(e: PointerEventState): void;
    dragStart(): void;
    findTargetByPoint(point: IVec): void;
    pointerDown(e: PointerEventState): void;
    pointerMove(e: PointerEventState): void;
    pointerUp(_: PointerEventState): void;
    quickConnect(point: IVec, element: GfxModel): void;
    getNextMode(): ConnectorMode;
}
//# sourceMappingURL=connector-tool.d.ts.map