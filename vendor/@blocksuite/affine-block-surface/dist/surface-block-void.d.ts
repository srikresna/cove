import { BlockComponent } from '@blocksuite/std';
import type { SurfaceBlockModel } from './surface-model.js';
export declare class SurfaceBlockVoidComponent extends BlockComponent<SurfaceBlockModel> {
    render(): symbol;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-surface-void': SurfaceBlockVoidComponent;
    }
}
//# sourceMappingURL=surface-block-void.d.ts.map