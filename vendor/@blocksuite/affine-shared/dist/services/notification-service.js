import { createIdentifier } from '@blocksuite/global/di';
import { EditorLifeCycleExtension } from '@blocksuite/std';
import { StoreIdentifier } from '@blocksuite/store';
export const NotificationProvider = createIdentifier('AffineNotificationService');
export function NotificationExtension(notificationService) {
    return {
        setup: di => {
            di.addImpl(NotificationProvider, provider => {
                return {
                    notify: notificationService.notify,
                    toast: notificationService.toast,
                    confirm: notificationService.confirm,
                    prompt: notificationService.prompt,
                    notifyWithUndoAction: options => {
                        notifyWithUndoActionImpl(provider, notificationService.notify, options);
                    },
                };
            });
        },
    };
}
function notifyWithUndoActionImpl(provider, notify, options) {
    const store = provider.get(StoreIdentifier);
    const abortController = new AbortController();
    const abort = () => {
        abortController.abort();
    };
    options.abort?.addEventListener('abort', abort);
    const clearOnClose = () => {
        store.history.undoManager.off('stack-item-added', addHandler);
        store.history.undoManager.off('stack-item-popped', popHandler);
        disposable.unsubscribe();
        options.abort?.removeEventListener('abort', abort);
    };
    const addHandler = store.history.undoManager.on('stack-item-added', abort);
    const popHandler = store.history.undoManager.on('stack-item-popped', abort);
    const disposable = provider
        .get(EditorLifeCycleExtension)
        .slots.unmounted.subscribe(() => abort());
    notify({
        ...options,
        actions: [
            {
                key: 'notification-card-undo',
                label: 'Undo',
                onClick: () => {
                    store.undo();
                    abortController.abort();
                },
            },
            ...(options.actions ?? []),
        ],
        abort: abortController.signal,
        onClose: () => {
            options.onClose?.();
            clearOnClose();
        },
    });
}
