import type { EditorHost } from "@blocksuite/std";
import { CalendarDays, Eye, FileText, Info, LayoutGrid, List, PanelRightClose } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import { cn } from "../../lib/utils";
import { requestPresentation } from "../../services/blocksuite/presentationIntent";
import type { NoteMeta } from "../../services/INoteService";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { formatFullTimestamp, formatRelativeDay } from "../../utils/time";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { CalendarPanel } from "./CalendarPanel";
import { ExportMenu } from "./ExportMenu";
import { FramePanelHost } from "./FramePanelHost";
import { LivePreview } from "./LivePreview";
import { NoteInfoPanel } from "./NoteInfoPanel";
import { OutlinePanelHost } from "./OutlinePanelHost";

const TAB_KEY = "cove-rightbar-tab";
type RightBarTab = "toc" | "calendar" | "info" | "preview" | "frames";

const isRightBarTab = (value: string | null): value is RightBarTab =>
  value === "toc" ||
  value === "calendar" ||
  value === "info" ||
  value === "preview" ||
  value === "frames";

interface EditorRightBarProps {
  note: Note;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;

  editorHost?: EditorHost | null;

  open?: boolean;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
    {children}
  </div>
);

export const EditorRightBar: React.FC<EditorRightBarProps> = ({
  note,
  scrollRef: _scrollRef,
  onClose,
  editorHost,
  open = true,
}) => {
  const [tab, setTab] = useState<RightBarTab>(() => {
    const stored = localStorage.getItem(TAB_KEY);
    return isRightBarTab(stored) ? stored : "toc";
  });
  const [backlinks, setBacklinks] = useState<NoteMeta[]>([]);
  const [outgoing, setOutgoing] = useState<NoteMeta[]>([]);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const updateNote = useNoteStore((s) => s.updateNote);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  useEffect(() => {
    noteService
      .backlinksOf(note.id)
      .then(setBacklinks)
      .catch((err) => {
        setBacklinks([]);
        notifyError(err);
      });
    noteService
      .outgoingLinksOf(note.id)
      .then(setOutgoing)
      .catch((err) => {
        setOutgoing([]);
        notifyError(err);
      });
  }, [note.id]);

  const openNote = (meta: NoteMeta) => {
    if (meta.workspaceId !== activeWorkspaceId) setActiveWorkspace(meta.workspaceId);
    setActiveNoteId(meta.id);
  };

  const selectTab = (next: RightBarTab) => {
    localStorage.setItem(TAB_KEY, next);
    setTab(next);
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-shrink-0 flex-col overflow-hidden border-l bg-background transition-[width,opacity] duration-200 ease-out",
        open ? "w-[340px] opacity-100" : "w-0 border-l-0 opacity-0",
      )}
    >
      <div className="flex w-[340px] flex-shrink-0 flex-col h-full">
        <div className="flex flex-shrink-0 items-center justify-between px-3 pt-3">
          <div className="flex items-center gap-0.5">
            {(
              [
                ["toc", MESSAGES.RIGHTBAR_TAB_TOC, List],
                ["preview", MESSAGES.RIGHTBAR_TAB_PREVIEW, Eye],
                ["frames", MESSAGES.RIGHTBAR_TAB_FRAMES, LayoutGrid],
                ["calendar", MESSAGES.RIGHTBAR_TAB_CALENDAR, CalendarDays],
                ["info", MESSAGES.RIGHTBAR_TAB_INFO, Info],
              ] as const
            ).map(([value, label, Icon]) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={label}
                    aria-pressed={tab === value}
                    onClick={() => selectTab(value)}
                    className={cn(
                      tab === value ? "bg-accent text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          {tab === "toc" && <ExportMenu noteId={note.id} />}
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={MESSAGES.RIGHTBAR_CLOSE}
            onClick={onClose}
            className="text-muted-foreground"
          >
            <PanelRightClose className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {}
        {(tab === "preview" || tab === "frames") && (
          <div className="min-h-0 flex-1 overflow-hidden p-2 pt-1">
            {tab === "preview" && <LivePreview noteId={note.id} />}
            {tab === "frames" && (
              <FramePanelHost
                editor={editorHost ?? null}
                mode={note.docMode ?? "page"}
                onStartPresentation={() => {
                  requestPresentation(note.id);
                  updateNote(note.id, { docMode: "edgeless" });
                }}
              />
            )}
          </div>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            (tab === "preview" || tab === "frames") && "hidden",
          )}
        >
          {tab === "calendar" && <CalendarPanel />}
          {tab === "info" && (
            <div className="px-2 pt-1">
              <NoteInfoPanel note={note} />
            </div>
          )}

          <div className={cn("px-2 pt-1", tab !== "toc" && "hidden")}>
            <OutlinePanelHost editor={editorHost ?? null} />
          </div>

          <div className={cn("px-2", tab !== "toc" && "hidden")}>
            <SectionLabel>
              {MESSAGES.BACKLINKS_TITLE}
              {backlinks.length > 0 && <span className="font-mono"> · {backlinks.length}</span>}
            </SectionLabel>
            {backlinks.length === 0 ? (
              <p className="px-2 pb-2 text-xs text-muted-foreground">{MESSAGES.BACKLINKS_EMPTY}</p>
            ) : (
              backlinks.map((meta) => (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => openNote(meta)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true" className="shrink-0 text-sm">
                    {meta.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                  </span>
                  <span className="truncate">{meta.title || MESSAGES.UNTITLED_NOTE}</span>
                </button>
              ))
            )}
          </div>

          <div className={cn("px-2", tab !== "toc" && "hidden")}>
            <SectionLabel>
              {MESSAGES.OUTGOING_TITLE}
              {outgoing.length > 0 && <span className="font-mono"> · {outgoing.length}</span>}
            </SectionLabel>
            {outgoing.length === 0 ? (
              <p className="px-2 pb-2 text-xs text-muted-foreground">{MESSAGES.OUTGOING_EMPTY}</p>
            ) : (
              outgoing.map((meta) => (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => openNote(meta)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true" className="shrink-0 text-sm">
                    {meta.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                  </span>
                  <span className="truncate">{meta.title || MESSAGES.UNTITLED_NOTE}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex-shrink-0 space-y-1 border-t p-3 font-mono text-[11px] text-muted-foreground",
            tab !== "toc" && "hidden",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-between">
                <span>{MESSAGES.INFO_CREATED_LABEL}</span>
                <span>{formatRelativeDay(note.createdAt)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">{formatFullTimestamp(note.createdAt)}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-between">
                <span>{MESSAGES.INFO_UPDATED_LABEL}</span>
                <span>{formatRelativeDay(note.updatedAt)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">{formatFullTimestamp(note.updatedAt)}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
