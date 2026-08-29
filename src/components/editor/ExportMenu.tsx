import { Download, FileCode, FileText, FileType2, Upload } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import { MESSAGES } from "../../constants/messages";
import { blockSuiteEditorService } from "../../di/container";
import { notifyError } from "../../store/notify";
import { useNotificationStore } from "../../store/useNotificationStore";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ExportMenuProps {
  noteId: string;
}

const toast = (message: string) =>
  useNotificationStore.getState().pushToast({ kind: "info", title: message });

export const ExportMenu: React.FC<ExportMenuProps> = ({ noteId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const run = async (format: "markdown" | "html" | "pdf") => {
    try {
      await blockSuiteEditorService.exportDoc(noteId, format);
      toast(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      notifyError(err);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const id = await blockSuiteEditorService.importMarkdownFile(file);
      toast(id ? "Markdown imported" : "Import returned no doc");
    } catch (err) {
      // The doc-created handler already toasted persistence failures.
      if (
        !(
          err instanceof Error &&
          (err as Error & { coveAlreadyNotified?: boolean }).coveAlreadyNotified
        )
      ) {
        notifyError(err);
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        className="hidden"
        hidden
        style={{ display: "none" }}
        onChange={onPickFile}
      />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconSm" aria-label={MESSAGES.RIGHTBAR_EXPORT}>
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{MESSAGES.RIGHTBAR_EXPORT}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => void run("markdown")}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>Markdown</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void run("html")}>
            <FileCode className="h-4 w-4" aria-hidden="true" />
            <span>HTML</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void run("pdf")}>
            <FileType2 className="h-4 w-4" aria-hidden="true" />
            <span>PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Import Markdown…</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
