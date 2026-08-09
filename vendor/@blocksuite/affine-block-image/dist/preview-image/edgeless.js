import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { toGfxBlockComponent } from '@blocksuite/std';
import { css } from 'lit';
import { ImagePlaceholderBlockComponent } from './page.js';
export class ImageEdgelessPlaceholderBlockComponent extends toGfxBlockComponent(ImagePlaceholderBlockComponent) {
    static { this.styles = css `
    affine-edgeless-placeholder-preview-image
      .affine-placeholder-preview-container {
      border: 1px solid ${unsafeCSSVarV2('layer/background/tertiary')};
    }
  `; }
    renderGfxBlock() {
        return super.renderGfxBlock();
    }
}
