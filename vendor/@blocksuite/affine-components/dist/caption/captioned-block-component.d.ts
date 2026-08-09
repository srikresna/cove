import { BlockComponent, type BlockService } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import { type StyleInfo } from 'lit/directives/style-map.js';
import type { BlockCaptionEditor } from './block-caption.js';
export declare enum SelectedStyle {
    Background = "Background",
    Border = "Border"
}
export declare class CaptionedBlockComponent<Model extends BlockModel = BlockModel, Service extends BlockService = BlockService, WidgetName extends string = string> extends BlockComponent<Model, Service, WidgetName> {
    static styles: import("lit").CSSResult;
    get captionEditor(): BlockCaptionEditor<BlockModel<import("./block-caption.js").BlockCaptionProps>> | undefined;
    constructor();
    private _renderWithWidget;
    private accessor _captionEditorRef;
    protected accessor blockContainerStyles: StyleInfo | undefined;
    protected accessor selectedStyle: SelectedStyle;
    protected accessor useCaptionEditor: boolean;
    protected accessor useZeroWidth: boolean;
}
//# sourceMappingURL=captioned-block-component.d.ts.map