import { BlockServiceIdentifier } from '../identifier.js';
import { LifeCycleWatcher } from './lifecycle-watcher.js';
export class ServiceManager extends LifeCycleWatcher {
    static { this.key = 'serviceManager'; }
    mounted() {
        super.mounted();
        this.std.provider.getAll(BlockServiceIdentifier).forEach(service => {
            service.mounted();
        });
    }
    unmounted() {
        super.unmounted();
        this.std.provider.getAll(BlockServiceIdentifier).forEach(service => {
            service.unmounted();
        });
    }
}
