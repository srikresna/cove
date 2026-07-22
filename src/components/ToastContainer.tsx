import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import type React from "react";
import { useNotificationStore } from "../store/useNotificationStore";

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-[14px] bg-cream-paper border-[1.5px] border-charcoal shadow-card-subtle text-cocoa-ink font-gelica"
            >
              <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
                {toast.kind === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                {toast.kind === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-marker-orange" />
                )}
                {toast.kind === "success" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                {toast.kind === "info" && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-cocoa-ink leading-snug">
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-normal">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label="Dismiss toast"
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-md text-charcoal hover:bg-dew-drop outline-none flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
