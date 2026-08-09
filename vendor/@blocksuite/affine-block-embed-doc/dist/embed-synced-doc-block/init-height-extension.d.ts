import { LifeCycleWatcher } from '@blocksuite/std';
export declare class HeightInitializationExtension extends LifeCycleWatcher {
    static key: string;
    mounted(): void;
    unmounted(): void;
    private readonly _initQueue;
    private readonly _disposables;
}
//# sourceMappingURL=init-height-extension.d.ts.map