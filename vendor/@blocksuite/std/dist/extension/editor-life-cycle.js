import { DisposableGroup } from '@blocksuite/global/disposable';
import { Subject } from 'rxjs';
import { LifeCycleWatcher } from './lifecycle-watcher';
export class EditorLifeCycleExtension extends LifeCycleWatcher {
    static { this.key = 'editor-life-cycle'; }
    constructor(std) {
        super(std);
        this.std = std;
        this.disposables = new DisposableGroup();
        this.slots = {
            created: new Subject(),
            mounted: new Subject(),
            rendered: new Subject(),
            unmounted: new Subject(),
        };
        this.disposables.add(this.slots.created);
        this.disposables.add(this.slots.mounted);
        this.disposables.add(this.slots.rendered);
        this.disposables.add(this.slots.unmounted);
    }
    created() {
        super.created();
        this.slots.created.next();
    }
    mounted() {
        super.mounted();
        this.slots.mounted.next();
    }
    rendered() {
        super.rendered();
        this.slots.rendered.next();
    }
    unmounted() {
        super.unmounted();
        this.slots.unmounted.next();
        this.disposables.dispose();
    }
}
