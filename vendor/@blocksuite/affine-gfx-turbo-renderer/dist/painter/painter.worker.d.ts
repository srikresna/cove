import { type ServiceProvider } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { BlockLayoutPainter, HostToWorkerMessage, ViewportLayoutTree } from '../types';
export declare const BlockPainterProvider: import("@blocksuite/global/di").ServiceIdentifier<BlockLayoutPainter> & (<U extends BlockLayoutPainter = BlockLayoutPainter>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const BlockLayoutPainterExtension: (type: string, painter: new () => BlockLayoutPainter) => ExtensionType;
export declare class ViewportLayoutPainter {
    private readonly canvas;
    private ctx;
    private zoom;
    provider: ServiceProvider;
    getPainter(type: string): BlockLayoutPainter | null;
    constructor(extensions: ExtensionType[]);
    setSize(layoutRectW: number, layoutRectH: number, dpr: number, zoom: number): void;
    private clearBackground;
    paint(layout: ViewportLayoutTree, version: number): void;
    paintTree(layout: ViewportLayoutTree, version: number): void;
    handler: (e: MessageEvent<HostToWorkerMessage>) => Promise<void>;
}
export declare function getBaseline(fontSize: number): number;
//# sourceMappingURL=painter.worker.d.ts.map