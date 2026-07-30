import { CalendarDays, FileText, Info, List, PanelRightClose } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import { cn } from "../../lib/utils";
import type { NoteMeta } from "../../services/INoteService";
import { extractBlockSuiteHeadings } from "../../services/editor/blockSuiteContent";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { walkBlocks } from "../../utils/blockTree";
import { formatFullTimestamp, formatRelativeDay } from "../../utils/time";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { CalendarPanel } from "./CalendarPanel";
import { NoteInfoPanel } from "./NoteInfoPanel";

const TAB_KEY = "cove-rightbar-tab";
type RightBarTab = "toc" | "calendar" | "info";

const isRightBarTab = (value: string | null): value is RightBarTab =>
  value === "toc" || value === "calendar" || value === "info";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface EditorRightBarProps {
  note: Note;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

function extractHeadings(content: string): TocItem[] {
  const blockSuiteHeadings = extractBlockSuiteHeadings(content);
  if (blockSuiteHeadings !== null) return blockSuiteHeadings;
  const items: TocItem[] = [];
  walkBlocks(content, (block) => {
    if (block.type !== "heading" || typeof block.id !== "string") return;
    const text = Array.isArray(block.content)
      ? block.content
          .map((c) => {
            const inline = c as { text?: unknown };
            return typeof inline?.text === "string" ? inline.text : "";
          })
          .join("")
          .trim()
      : "";
    if (!text) return;
    items.push({
      id: block.id,
      text,
      level: typeof block.props?.level === "number" ? block.props.level : 1,
    });
  });
  return items;
}

const INDENT_BY_LEVEL: Record<number, string> = { 1: "pl-2", 2: "pl-4", 3: "pl-6" };

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
    {children}
  </div>
);

export const EditorRightBar: React.FC<EditorRightBarProps> = ({ note, scrollRef, onClose }) => {
  const [tab, setTab] = useState<RightBarTab>(() => {
    const stored = localStorage.getItem(TAB_KEY);
    return isRightBarTab(stored) ? stored : "toc";
  });
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [backlinks, setBacklinks] = useState<NoteMeta[]>([]);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const headings = useMemo(() => extractHeadings(note.content), [note.content]);

  useEffect(() => {
    noteService
      .backlinksOf(note.id)
      .then(setBacklinks)
      .catch((err) => {
        setBacklinks([]);
        notifyError(err);
      });
  }, [note.id]);

  const updateActiveHeading = useCallback(() => {
    const container = scrollRef.current;
    if (!container || headings.length === 0) return;
    const center = container.getBoundingClientRect().top + container.clientHeight / 2;
    let current: string | null = headings[0]?.id ?? null;
    for (const h of headings) {
      // data-id is BlockNote's block attribute, data-block-id is BlockSuite's.
      const el = container.querySelector(`[data-id="${h.id}"], [data-block-id="${h.id}"]`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top < center + rect.height) current = h.id;
    }
    setActiveHeadingId(current);
  }, [headings, scrollRef]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateActiveHeading();
    container.addEventListener("scroll", updateActiveHeading, { passive: true });
    return () => container.removeEventListener("scroll", updateActiveHeading);
  }, [scrollRef, updateActiveHeading]);

  const scrollToHeading = (id: string) => {
    const el = scrollRef.current?.querySelector(`[data-id="${id}"], [data-block-id="${id}"]`);
    if (!(el instanceof HTMLElement)) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("cove-block-flash");
    window.setTimeout(() => el.classList.remove("cove-block-flash"), 1000);
  };

  const openBacklink = (meta: NoteMeta) => {
    if (meta.workspaceId !== activeWorkspaceId) setActiveWorkspace(meta.workspaceId);
    setActiveNoteId(meta.id);
  };

  const selectTab = (next: RightBarTab) => {
    localStorage.setItem(TAB_KEY, next);
    setTab(next);
  };

  return (
    <aside className="flex h-full w-[264px] flex-shrink-0 flex-col overflow-y-auto border-l bg-background">
      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-0.5">
          {(
            [
              ["toc", MESSAGES.RIGHTBAR_TAB_TOC, List],
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

      {tab === "calendar" && <CalendarPanel />}
      {tab === "info" && (
        <div className="px-2 pt-1">
          <NoteInfoPanel note={note} />
        </div>
      )}

      <div className={cn("px-2 pt-1", tab !== "toc" && "hidden")}>
        {headings.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-muted-foreground">
            {MESSAGES.TOC_EMPTY}
          </p>
        ) : (
          headings.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                INDENT_BY_LEVEL[h.level] ?? "pl-2",
                h.level === 1 ? "font-semibold" : "font-normal",
                activeHeadingId === h.id ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className="truncate">{h.text}</span>
            </button>
          ))
        )}
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
              onClick={() => openBacklink(meta)}
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

      <div
        className={cn(
          "mt-auto space-y-1 border-t p-3 font-mono text-[11px] text-muted-foreground",
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
    </aside>
  );
};
