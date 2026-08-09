import { EmbedFigmaBlockComponent } from './embed-figma-block';
import { EmbedEdgelessBlockComponent } from './embed-figma-block/embed-edgeless-figma-block';
import { EmbedGithubBlockComponent } from './embed-github-block';
import { EmbedEdgelessGithubBlockComponent } from './embed-github-block/embed-edgeless-github-block';
import { EmbedHtmlBlockComponent } from './embed-html-block';
import { EmbedHtmlFullscreenToolbar } from './embed-html-block/components/fullscreen-toolbar';
import { EmbedEdgelessHtmlBlockComponent } from './embed-html-block/embed-edgeless-html-block';
import { EmbedIframeErrorCard } from './embed-iframe-block/components/embed-iframe-error-card';
import { EmbedIframeIdleCard } from './embed-iframe-block/components/embed-iframe-idle-card';
import { EmbedIframeLinkEditPopup } from './embed-iframe-block/components/embed-iframe-link-edit-popup';
import { EmbedIframeLinkInputPopup } from './embed-iframe-block/components/embed-iframe-link-input-popup';
import { EmbedIframeLoadingCard } from './embed-iframe-block/components/embed-iframe-loading-card';
import { EmbedIframeBlockComponent } from './embed-iframe-block/embed-iframe-block';
import { EmbedLoomBlockComponent } from './embed-loom-block';
import { EmbedEdgelessLoomBlockComponent } from './embed-loom-block/embed-edgeless-loom-bock';
import { EmbedYoutubeBlockComponent } from './embed-youtube-block';
import { EmbedEdgelessYoutubeBlockComponent } from './embed-youtube-block/embed-edgeless-youtube-block';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'affine-embed-figma-block': EmbedFigmaBlockComponent;
        'affine-embed-edgeless-figma-block': EmbedEdgelessBlockComponent;
        'affine-embed-github-block': EmbedGithubBlockComponent;
        'affine-embed-edgeless-github-block': EmbedEdgelessGithubBlockComponent;
        'affine-embed-html-block': EmbedHtmlBlockComponent;
        'affine-embed-edgeless-html-block': EmbedEdgelessHtmlBlockComponent;
        'embed-html-fullscreen-toolbar': EmbedHtmlFullscreenToolbar;
        'affine-embed-edgeless-loom-block': EmbedEdgelessLoomBlockComponent;
        'affine-embed-loom-block': EmbedLoomBlockComponent;
        'affine-embed-youtube-block': EmbedYoutubeBlockComponent;
        'affine-embed-edgeless-youtube-block': EmbedEdgelessYoutubeBlockComponent;
        'affine-embed-iframe-block': EmbedIframeBlockComponent;
        'embed-iframe-link-input-popup': EmbedIframeLinkInputPopup;
        'embed-iframe-loading-card': EmbedIframeLoadingCard;
        'embed-iframe-error-card': EmbedIframeErrorCard;
        'embed-iframe-idle-card': EmbedIframeIdleCard;
        'embed-iframe-link-edit-popup': EmbedIframeLinkEditPopup;
    }
}
//# sourceMappingURL=effects.d.ts.map