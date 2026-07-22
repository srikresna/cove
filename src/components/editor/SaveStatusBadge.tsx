import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type React from "react";
import { useSaveStatusStore } from "../../store/useSaveStatusStore";

export const SaveStatusBadge: React.FC = () => {
  const { status, errorMessage } = useSaveStatusStore();

  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-dew-drop border border-charcoal text-[11px] font-bold text-cocoa-ink">
      {status === "saving" && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-marker-orange" aria-hidden="true" />
          <span>Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Saved</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          <span className="text-red-600">{errorMessage || "Save Failed"}</span>
        </>
      )}
    </div>
  );
};
