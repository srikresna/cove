import { DisposableGroup } from '@blocksuite/global/disposable';
import { noop } from '@blocksuite/global/utils';
import { startWith } from 'rxjs';
import { Overlay } from './overlay';
export class ToolOverlay extends Overlay {
    constructor(gfx) {
        super(gfx);
        this.disposables = new DisposableGroup();
        this.x = 0;
        this.y = 0;
        this.globalAlpha = 1;
        this.gfx = gfx;
        this.disposables.add(this.gfx.viewport.viewportUpdated.pipe(startWith(null)).subscribe(() => {
            // when viewport is updated, we should keep the overlay in the same position
            // to get last mouse position and convert it to model coordinates
            const pos = this.gfx.tool.lastMouseViewPos$.value;
            const [x, y] = this.gfx.viewport.toModelCoord(pos.x, pos.y);
            this.x = x;
            this.y = y;
        }));
    }
    dispose() {
        this.disposables.dispose();
    }
    render(ctx, rc) {
        noop([ctx, rc]);
    }
}
