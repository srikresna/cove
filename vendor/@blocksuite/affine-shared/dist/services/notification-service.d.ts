import { type ExtensionType } from '@blocksuite/store';
import type { TemplateResult } from 'lit';
export interface NotificationService {
    toast(message: string, options?: {
        duration?: number;
        portal?: HTMLElement;
    }): void;
    confirm(options: {
        title: string | TemplateResult;
        message: string | TemplateResult;
        confirmText?: string;
        cancelText?: string;
        abort?: AbortSignal;
    }): Promise<boolean>;
    prompt(options: {
        title: string | TemplateResult;
        message: string | TemplateResult;
        autofill?: string;
        placeholder?: string;
        confirmText?: string;
        cancelText?: string;
        abort?: AbortSignal;
    }): Promise<string | null>;
    notify(options: {
        title: string | TemplateResult;
        message?: string | TemplateResult;
        accent?: 'info' | 'success' | 'warning' | 'error';
        duration?: number;
        abort?: AbortSignal;
        actions?: {
            key: string;
            label: string | TemplateResult;
            onClick: () => void;
        }[];
        onClose?: () => void;
    }): void;
    /**
     * Notify with undo action, it is a helper function to notify with undo action.
     * And the notification card will be closed when undo action is triggered by shortcut key or other ways.
     */
    notifyWithUndoAction: (options: Parameters<NotificationService['notify']>[0]) => void;
}
export declare const NotificationProvider: import("@blocksuite/global/di").ServiceIdentifier<NotificationService> & (<U extends NotificationService = NotificationService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function NotificationExtension(notificationService: NotificationService): ExtensionType;
//# sourceMappingURL=notification-service.d.ts.map