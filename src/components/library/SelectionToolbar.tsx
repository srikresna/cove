import { Trash2, X } from "lucide-react";
import type React from "react";
import { MESSAGES } from "../../constants/messages";
import { Button } from "../ui/button";

/**
 * A floating pill at the bottom of the Library while notes are selected,
 * with the count and bulk actions.
 */
export const SelectionToolbar: React.FC<{
  count: number;
  onBulkTrash: () => void;
  onClear: () => void;
}> = ({ count, onBulkTrash, onClear }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
    <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-card px-4 py-1.5 shadow-lg">
      <span className="text-sm font-medium text-foreground">
        {MESSAGES.LIBRARY_SELECTED.replace("{n}", String(count))}
      </span>
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onBulkTrash}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {MESSAGES.LIBRARY_BULK_TRASH}
      </Button>
      <button
        type="button"
        aria-label={MESSAGES.LIBRARY_CLEAR_SELECTION}
        onClick={onClear}
        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  </div>
);
