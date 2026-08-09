import type { IBound } from '@blocksuite/global/gfx';
import { type BlockStdScope, type EditorHost } from '@blocksuite/std';
import { GfxBlockElementModel, type GfxController, GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import type { ExtensionType, Store } from '@blocksuite/store';
import { CanvasRenderer } from '../../renderer/canvas-renderer.js';
export type ExportOptions = {
    imageProxyEndpoint: string;
};
export declare class ExportManager {
    readonly std: BlockStdScope;
    private readonly _exportOptions;
    replaceImgSrcWithSvg: (element: HTMLElement) => Promise<void>;
    get doc(): Store;
    get editorHost(): EditorHost;
    constructor(std: BlockStdScope);
    private _checkCanContinueToCanvas;
    private _checkReady;
    private _createCanvas;
    private _disableMediaPrint;
    private _docToCanvas;
    private _drawEdgelessBackground;
    private _enableMediaPrint;
    private _html2canvas;
    private _toCanvas;
    edgelessToCanvas(surfaceRenderer: CanvasRenderer, bound: IBound, gfx: GfxController, blocks?: GfxBlockElementModel[], elements?: GfxPrimitiveElementModel[], edgelessBackground?: {
        zoom: number;
    }): Promise<HTMLCanvasElement | undefined>;
    exportPdf(): Promise<void>;
    exportPng(): Promise<void>;
}
export declare const ExportManagerExtension: ExtensionType;
//# sourceMappingURL=export-manager.d.ts.map