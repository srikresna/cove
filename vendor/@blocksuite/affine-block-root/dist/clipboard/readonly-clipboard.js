import { copyMiddleware, defaultImageProxyMiddleware, titleMiddleware, } from '@blocksuite/affine-shared/adapters';
import { copySelectedModelsCommand, draftSelectedModelsCommand, getSelectedModelsCommand, } from '@blocksuite/affine-shared/commands';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { LifeCycleWatcher } from '@blocksuite/std';
/**
 * ReadOnlyClipboard is a class that provides a read-only clipboard for the root block.
 * It is supported to copy models in the root block.
 */
export class ReadOnlyClipboard extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        this._copySelectedInPage = (onCopy) => {
            return this.std.command
                .chain()
                .with({ onCopy })
                .pipe(getSelectedModelsCommand, { types: ['block', 'text', 'image'] })
                .pipe(draftSelectedModelsCommand)
                .pipe(copySelectedModelsCommand);
        };
        this._disposables = new DisposableGroup();
        this._initAdapters = () => {
            const copy = copyMiddleware(this.std);
            this.std.clipboard.use(copy);
            this.std.clipboard.use(titleMiddleware(this.std.store.workspace.meta.docMetas));
            this.std.clipboard.use(defaultImageProxyMiddleware);
            this._disposables.add({
                dispose: () => {
                    this.std.clipboard.unuse(copy);
                    this.std.clipboard.unuse(titleMiddleware(this.std.store.workspace.meta.docMetas));
                    this.std.clipboard.unuse(defaultImageProxyMiddleware);
                },
            });
        };
        this.onPageCopy = ctx => {
            const e = ctx.get('clipboardState').raw;
            e.preventDefault();
            this._copySelectedInPage().run();
        };
    }
    static { this.key = 'affine-readonly-clipboard'; }
    mounted() {
        if (!navigator.clipboard) {
            console.error('navigator.clipboard is not supported in current environment.');
            return;
        }
        if (this._disposables.disposed) {
            this._disposables = new DisposableGroup();
        }
        this.std.event.add('copy', this.onPageCopy);
        this._initAdapters();
    }
}
