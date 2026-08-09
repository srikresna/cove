import type { BlockCaptionEditor } from '@blocksuite/affine-components/caption';
import { type SurfaceRefBlockModel } from '@blocksuite/affine-model';
import { type OpenDocMode } from '@blocksuite/affine-shared/services';
import { BlockComponent, type EditorHost } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
import { nothing } from 'lit';
export declare class SurfaceRefBlockComponent extends BlockComponent<SurfaceRefBlockModel> {
    static styles: import("lit").CSSResult;
    private _previewDoc;
    private _runtimePreviewExt;
    private get _viewExtensionManager();
    private get _previewSpec();
    private _referencedModel;
    private readonly _referenceXYWH$;
    private get _shouldRender();
    get referenceModel(): GfxModel | null;
    get isCommentHighlighted(): boolean;
    private readonly _handleClick;
    private _initHotkey;
    private _initReferencedModel;
    private _initViewport;
    private _initHover;
    private _renderRefContent;
    readonly open: ({ openMode, event, }?: {
        openMode?: OpenDocMode;
        event?: MouseEvent;
    }) => void;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    viewInEdgeless(): void;
    accessor hoverableContainer: HTMLDivElement;
    accessor captionElement: BlockCaptionEditor;
    accessor previewEditor: EditorHost | null;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-surface-ref': SurfaceRefBlockComponent;
    }
}
//# sourceMappingURL=surface-ref-block.d.ts.map