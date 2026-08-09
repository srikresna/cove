import { DisposableGroup } from '@blocksuite/global/disposable';
import { LifeCycleWatcher, type UIEventHandler } from '@blocksuite/std';
/**
 * ReadOnlyClipboard is a class that provides a read-only clipboard for the root block.
 * It is supported to copy models in the root block.
 */
export declare class ReadOnlyClipboard extends LifeCycleWatcher {
    static key: string;
    protected readonly _copySelectedInPage: (onCopy?: () => void) => import("@blocksuite/std").Chain<import("@blocksuite/std").InitCommandCtx & {
        onCopy: (() => void) | undefined;
    } & {
        types?: Array<"image" | "text" | "block" | "surface">;
        mode?: "all" | "flat" | "highest";
    } & {
        selectedModels: import("@blocksuite/store").BlockModel[];
    } & {
        draftedModels: Promise<import("@blocksuite/store").DraftModel<import("@blocksuite/store").BlockModel<object>>[]>;
    }>;
    protected _disposables: DisposableGroup;
    protected _initAdapters: () => void;
    onPageCopy: UIEventHandler;
    mounted(): void;
}
//# sourceMappingURL=readonly-clipboard.d.ts.map