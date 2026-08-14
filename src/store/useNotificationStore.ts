import { create } from "zustand";

export interface ToastItem {
  id: string;
  kind: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  durationMs?: number;
}

interface NotificationState {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

const MAX_TOASTS = 5;

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],

  pushToast: (toast) => {
    const id = crypto.randomUUID();
    const newToast: ToastItem = { ...toast, id };

    set((state) => {
      const duplicate = state.toasts.some(
        (t) =>
          t.kind === toast.kind && t.title === toast.title && t.description === toast.description,
      );
      if (duplicate) return state;
      return { toasts: [...state.toasts, newToast].slice(-MAX_TOASTS) };
    });

    const duration = toast.durationMs ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
