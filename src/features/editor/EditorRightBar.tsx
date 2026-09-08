import type { EditorHost } from "@blocksuite/std";
import { CalendarDays, Eye, FileText, Info, LayoutGrid, List, PanelRightClose } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { requestPresentation } from "../../services/blocksuite/presentationIntent";
import type { NoteMeta } from "../../services/INoteService";
import { noteActions } from "../../store/noteActions";
import { notifyError } from "../../store/notify";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { formatFullTimestamp, formatRelativeDay } from "../../utils/time";
import { CalendarPanel } from "./CalendarPanel";
import { ExportMenu } from "./ExportMenu";
import { FramePanelHost } from "./FramePanelHost";
import { LivePreview } from "./LivePreview";
import { OutlinePanelHost } from "./OutlinePanelHost";
import { PropertyManagerPanel } from "./PropertyManagerPanel";
import { PROPERTY_TYPE_META } from "./propertyRows/NotePropertiesRows";
import { SegmentedIconGroup } from "./SegmentedIconGroup";

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
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onClose: (viaKeyboard: boolean) => void;
  headerRef?: React.Ref<HTMLDivElement>;

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
  onClose,
  headerRef,
  editorHost,
  open = true,
}) => {
  const [tab, setTab] = useState<RightBarTab>(() => {
    const stored = localStorage.getItem(TAB_KEY);
    return isRightBarTab(stored) ? stored : "toc";
  });
  const [backlinks, setBacklinks] = useState<NoteMeta[]>([]);
  const [outgoing, setOutgoing] = useState<NoteMeta[]>([]);
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const updateNote = noteActions.updateNote;
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: note.updatedAt intentionally retriggers the fetch after content saves
  useEffect(() => {
    setBacklinks([]);
    setOutgoing([]);
    let cancelled = false;
    noteService
      .backlinksOf(note.id)
      .then((metas) => {
        if (!cancelled) setBacklinks(metas);
      })
      .catch((err) => {
        if (!cancelled) {
          setBacklinks([]);
          notifyError(err);
        }
      });
    noteService
      .outgoingLinksOf(note.id)
      .then((metas) => {
        if (!cancelled) setOutgoing(metas);
      })
      .catch((err) => {
        if (!cancelled) {
          setOutgoing([]);
          notifyError(err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [note.id, note.updatedAt]);

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
        open ? "w-[340px] opacity-100" : "w-0 border-l-0 opacity-0 invisible",
      )}
    >
      <div className="flex h-full w-[340px] flex-shrink-0 flex-col">
        <div
          ref={headerRef}
          className="flex h-10 flex-shrink-0 items-center justify-between border-b bg-card px-2"
        >
          <SegmentedIconGroup
            variant="tabs"
            aria-label={MESSAGES.RIGHTBAR_TABS}
            items={[
              { value: "toc", label: MESSAGES.RIGHTBAR_TAB_TOC, icon: List },
              { value: "preview", label: MESSAGES.RIGHTBAR_TAB_PREVIEW, icon: Eye },
              { value: "frames", label: MESSAGES.RIGHTBAR_TAB_FRAMES, icon: LayoutGrid },
              { value: "calendar", label: MESSAGES.RIGHTBAR_TAB_CALENDAR, icon: CalendarDays },
              { value: "info", label: MESSAGES.RIGHTBAR_TAB_INFO, icon: Info },
            ]}
            value={tab}
            onChange={selectTab}
          />
          <div className="flex items-center gap-0.5">
            {tab === "toc" && <ExportMenu noteId={note.id} />}
            <Button
              variant="ghost"
              size="iconSm"
              aria-label={MESSAGES.RIGHTBAR_CLOSE}
              onClick={(e) => onClose(e.detail === 0)}
              className="text-muted-foreground"
            >
              <PanelRightClose className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

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
          {tab === "info" && <PropertyManagerPanel typeMeta={PROPERTY_TYPE_META} />}

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
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] leading-4 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] leading-4 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
