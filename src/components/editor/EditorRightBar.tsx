import { PanelRightClose } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import { cn } from "../../lib/utils";
import type { NoteMeta } from "../../services/INoteService";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { formatFullTimestamp, formatRelativeDay } from "../../utils/time";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
  if (!content) return [];
  let blocks: unknown;
  try {
    blocks = JSON.parse(content);
  } catch {
    return [];
  }
  const items: TocItem[] = [];
  const visit = (nodes: unknown): void => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      const block = node as {
        id?: unknown;
        type?: unknown;
        props?: { level?: unknown };
        content?: unknown;
        children?: unknown;
      };
      if (block?.type === "heading" && typeof block.id === "string") {
        const text = Array.isArray(block.content)
          ? block.content
              .map((c) => {
                const inline = c as { text?: unknown };
                return typeof inline?.text === "string" ? inline.text : "";
              })
              .join("")
              .trim()
          : "";
        if (text) {
          items.push({
            id: block.id,
            text,
            level: typeof block.props?.level === "number" ? block.props.level : 1,
          });
        }
      }
      visit(block?.children);
    }
  };
  visit(blocks);
  return items;
}

const INDENT_BY_LEVEL: Record<number, string> = { 1: "pl-2", 2: "pl-4", 3: "pl-6" };

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
    {children}
  </div>
);

export const EditorRightBar: React.FC<EditorRightBarProps> = ({ note, scrollRef, onClose }) => {
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
      .catch(() => setBacklinks([]));
  }, [note.id]);

  const updateActiveHeading = useCallback(() => {
    const container = scrollRef.current;
    if (!container || headings.length === 0) return;
    const center = container.getBoundingClientRect().top + container.clientHeight / 2;
    let current: string | null = headings[0]?.id ?? null;
    for (const h of headings) {
      const el = container.querySelector(`[data-id="${h.id}"]`);
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
    const el = scrollRef.current?.querySelector(`[data-id="${id}"]`);
    if (!(el instanceof HTMLElement)) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("cove-block-flash");
    window.setTimeout(() => el.classList.remove("cove-block-flash"), 1000);
  };

  const openBacklink = (meta: NoteMeta) => {
    if (meta.workspaceId !== activeWorkspaceId) setActiveWorkspace(meta.workspaceId);
    setActiveNoteId(meta.id);
  };

  return (
    <aside className="flex h-full w-[264px] flex-shrink-0 flex-col overflow-y-auto border-l bg-background">
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-sm font-medium text-muted-foreground">{MESSAGES.TOC_TITLE}</span>
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

      <div className="px-2 pt-1">
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

      <div className="px-2">
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
                {meta.icon || "📝"}
              </span>
              <span className="truncate">{meta.title || MESSAGES.UNTITLED_NOTE}</span>
            </button>
          ))
        )}
      </div>

      <div className="mt-auto space-y-1 border-t p-3 font-mono text-[11px] text-muted-foreground">
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
