import { useEffect } from "react";
import { useBlockSuiteDialogStore } from "../../store/useBlockSuiteDialogStore";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";

export const BlockSuiteDialogs = () => {
  const {
    open,
    kind,
    title,
    message,
    confirmText,
    cancelText,
    placeholder,
    input,
    setInput,
    ok,
    cancel,
  } = useBlockSuiteDialogStore();

  useEffect(() => {
    if (!open || kind !== "prompt") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        ok();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, kind, ok]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) cancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        {message ? (
          <DialogDescription className="text-sm text-muted-foreground">{message}</DialogDescription>
        ) : null}
        {kind === "prompt" && (
          <input
            autoFocus
            value={input}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
          />
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={cancel}>
            {cancelText}
          </Button>
          <Button size="sm" onClick={ok}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
