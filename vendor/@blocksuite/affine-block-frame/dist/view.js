import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { EdgelessClipboardFrameConfig } from './edgeless-clipboard-config';
import { frameQuickTool } from './edgeless-toolbar';
import { effects } from './effects';
import { FrameBlockInteraction } from './frame-block';
import { FrameHighlightManager } from './frame-highlight-manager';
import { FrameBlockSpec } from './frame-spec';
import { FrameTool } from './frame-tool';
import { frameToolbarExtension } from './frame-toolbar';
import { edgelessNavigatorBgWidget } from './present/navigator-bg-widget';
import { PresentTool } from './present-tool';
export class FrameViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-frame-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(FrameBlockSpec);
        if (this.isEdgeless(context.scope)) {
            context.register(FrameHighlightManager);
            context.register(FrameTool);
            context.register(PresentTool);
            context.register(frameQuickTool);
            context.register(frameToolbarExtension);
            context.register(edgelessNavigatorBgWidget);
            context.register(EdgelessClipboardFrameConfig);
            context.register(FrameBlockInteraction);
        }
    }
}
