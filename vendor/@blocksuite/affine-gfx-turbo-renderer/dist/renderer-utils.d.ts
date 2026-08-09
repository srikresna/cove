import type { EditorHost } from '@blocksuite/std';
import { type Viewport } from '@blocksuite/std/gfx';
import type { RenderingState, ViewportLayoutTree } from './types';
export declare function syncCanvasSize(canvas: HTMLCanvasElement, host: HTMLElement, zoom?: number): void;
export declare function getViewportLayoutTree(host: EditorHost, viewport: Viewport): ViewportLayoutTree;
export declare function debugLog(message: string, state: RenderingState): void;
export declare function paintPlaceholder(canvas: HTMLCanvasElement, layout: ViewportLayoutTree | null, viewport: Viewport): void;
//# sourceMappingURL=renderer-utils.d.ts.map