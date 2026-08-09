import type { GfxBlockElementModel, GfxModel, Viewport } from '@blocksuite/std/gfx';
export declare function isMindmapNode(element: GfxBlockElementModel | GfxModel | null): boolean;
export declare function isSingleMindMapNode(els: GfxModel[]): boolean;
export declare function isElementOutsideViewport(viewport: Viewport, element: GfxModel, padding?: [number, number]): boolean;
export declare function getNearestTranslation(viewport: Viewport, element: GfxModel, padding?: [number, number]): number[];
//# sourceMappingURL=index.d.ts.map