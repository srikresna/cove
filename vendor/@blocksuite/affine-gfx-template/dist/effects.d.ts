import { OverlayScrollbar } from './toolbar/overlay-scrollbar';
import { AffineTemplateLoading } from './toolbar/template-loading';
import { EdgelessTemplatePanel } from './toolbar/template-panel';
import { EdgelessTemplateButton } from './toolbar/template-tool-button';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-templates-panel': EdgelessTemplatePanel;
        'overlay-scrollbar': OverlayScrollbar;
        'edgeless-template-button': EdgelessTemplateButton;
        'affine-template-loading': AffineTemplateLoading;
    }
}
//# sourceMappingURL=effects.d.ts.map