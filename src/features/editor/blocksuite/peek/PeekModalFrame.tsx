import { AlertTriangle, Loader2 } from "lucide-react";
import type React from "react";
import * as DialogPrimitive from "../../../../components/ui/dialog-primitives";

interface PeekModalFrameProps {
  open: boolean;
  onClose: () => void;
  error: boolean;
  loading: boolean;
  loadingLabel: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}

export const PeekModalFrame: React.FC<PeekModalFrameProps> = ({
  open,
  onClose,
  error,
  loading,
  loadingLabel,
  controls,
  children,
}) => (
  <DialogPrimitive.Root modal={false} open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogPrimitive.Portal>
      <div className="peek-modal-overlay" />
      <div data-peek-view-wrapper="" data-mode="fit" className="peek-modal-wrapper">
        <div className="peek-modal-container">
          <div className="peek-modal-clip">
            <DialogPrimitive.Content
              aria-describedby={undefined}
              className="peek-modal-content peek-dialog-frame"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              onPointerDownOutside={(e) => {
                const el = e.target as HTMLElement;
                if (el.closest("[data-peek-view-wrapper]") || el.closest("affine-slash-menu")) {
                  e.preventDefault();
                }
              }}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <DialogPrimitive.Title className="sr-only">Peek view</DialogPrimitive.Title>
              {children}
              {error && (
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <div className="text-sm font-medium text-muted-foreground">
                    Could not open this frame
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    The editor hit an unexpected error. Try reopening the note.
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="pointer-events-auto mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              )}
              {loading && !error && (
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
                  <Loader2
                    className="h-6 w-6 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="text-sm font-medium text-muted-foreground">Loading</div>
                  <div className="text-xs text-muted-foreground/70">{loadingLabel}</div>
                </div>
              )}
            </DialogPrimitive.Content>
          </div>
          <div className="peek-modal-controls">{controls}</div>
        </div>
      </div>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export default PeekModalFrame;
