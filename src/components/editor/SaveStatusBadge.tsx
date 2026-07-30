import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type React from "react";
import { useSaveStatusStore } from "../../store/useSaveStatusStore";

export const SaveStatusBadge: React.FC = () => {
  const status = useSaveStatusStore((s) => s.status);
  const errorMessage = useSaveStatusStore((s) => s.errorMessage);

  if (status === "idle") return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">·</span>
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-primary" aria-hidden="true" />
          <span>Saving…</span>
        </>
      )}

      {status === "saved" && (
        <>
          <CheckCircle2 className="h-3 w-3 text-primary" aria-hidden="true" />
          <span>Saved</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
          <span className="text-destructive">{errorMessage || "Save Failed"}</span>
        </>
      )}
    </span>
  );
};
