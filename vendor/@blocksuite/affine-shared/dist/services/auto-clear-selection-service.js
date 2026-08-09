import { LifeCycleWatcher } from '@blocksuite/std';
// Auto Clear selection when switching doc mode.
export class AutoClearSelectionService extends LifeCycleWatcher {
    static { this.key = 'auto-clear-selection-service'; }
    unmounted() {
        if (this.std.store.readonly)
            return;
        this.std.selection.clear();
    }
}
