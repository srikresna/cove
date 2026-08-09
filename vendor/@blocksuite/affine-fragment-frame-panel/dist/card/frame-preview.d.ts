import type { FrameBlockModel } from '@blocksuite/affine-model';
import { BlockStdScope, type EditorHost, ShadowlessElement } from '@blocksuite/std';
import { type Store } from '@blocksuite/store';
import { type PropertyValues } from 'lit';
export declare const AFFINE_FRAME_PREVIEW = "frame-preview";
declare const FramePreview_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class FramePreview extends FramePreview_base {
    static styles: import("lit").CSSResult;
    private readonly _clearFrameDisposables;
    private readonly _docFilter;
    private _frameDisposables;
    private _previewDoc;
    private _runtimePreviewExt;
    private get _viewExtensionManager();
    private get _previewSpec();
    private readonly _updateFrameViewportWH;
    get _originalDoc(): Store;
    private _initPreviewDoc;
    private _initSpec;
    private _refreshViewport;
    private _renderSurfaceContent;
    private _setFrameDisposables;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    updated(_changedProperties: PropertyValues): void;
    accessor std: BlockStdScope;
    accessor fillScreen: boolean;
    accessor frame: FrameBlockModel;
    accessor frameViewportWH: {
        width: number;
        height: number;
    };
    accessor previewEditor: EditorHost | null;
    accessor surfaceHeight: number;
    accessor surfaceWidth: number;
}
export {};
//# sourceMappingURL=frame-preview.d.ts.map