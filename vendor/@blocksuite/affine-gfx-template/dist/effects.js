import { OverlayScrollbar } from './toolbar/overlay-scrollbar';
import { AffineTemplateLoading } from './toolbar/template-loading';
import { EdgelessTemplatePanel } from './toolbar/template-panel';
import { EdgelessTemplateButton } from './toolbar/template-tool-button';
export function effects() {
    customElements.define('edgeless-templates-panel', EdgelessTemplatePanel);
    customElements.define('overlay-scrollbar', OverlayScrollbar);
    customElements.define('edgeless-template-button', EdgelessTemplateButton);
    customElements.define('affine-template-loading', AffineTemplateLoading);
}
