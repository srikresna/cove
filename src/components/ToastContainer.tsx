import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import type React from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { Button } from "./ui/button";

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <output
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border bg-popover p-3.5 shadow-md"
            >
              <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
                {toast.kind === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                {toast.kind === "warning" && <AlertTriangle className="h-4 w-4 text-warm" />}
                {toast.kind === "success" && <CheckCircle className="h-4 w-4 text-primary" />}
                {toast.kind === "info" && <Info className="h-4 w-4 text-muted-foreground" />}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-foreground">{toast.title}</h4>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
                    {toast.description}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label="Dismiss toast"
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 [&_svg]:size-3.5"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </output>
  );
};
