import { LifeCycleWatcher } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
export class EdgelessLocker extends LifeCycleWatcher {
    static { this.key = 'edgeless-locker'; }
    mounted() {
        const { viewport } = this.std.get(GfxControllerIdentifier);
        viewport.locked = true;
    }
}
