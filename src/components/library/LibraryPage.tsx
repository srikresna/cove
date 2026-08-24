import { ArrowDownAZ, ArrowUpAZ, Check, Clock, Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useNoteStore } from "../../store/useNoteStore";
import { useTagStore } from "../../store/useTagStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FilterBar } from "./FilterBar";
import { LibraryNoteList, type LibrarySort } from "./LibraryNoteList";

const SORT_KEY = "cove-library-sort";

const isLibrarySort = (value: string): value is LibrarySort =>
  [
    "updated-desc",
    "updated-asc",
    "created-desc",
    "created-asc",
    "title-asc",
    "title-desc",
  ].includes(value);

interface SortOption {
  value: LibrarySort;
  label: string;
  icon: React.ReactNode;
}

const SORT_OPTIONS: Array<{ group: string; items: SortOption[] }> = [
  {
    group: MESSAGES.LIBRARY_SORT_UPDATED,
    items: [
      {
        value: "updated-desc",
        label: MESSAGES.LIBRARY_SORT_DESC,
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      },
      {
        value: "updated-asc",
        label: MESSAGES.LIBRARY_SORT_ASC,
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      },
    ],
  },
  {
    group: MESSAGES.LIBRARY_SORT_CREATED,
    items: [
      {
        value: "created-desc",
        label: MESSAGES.LIBRARY_SORT_DESC,
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      },
      {
        value: "created-asc",
        label: MESSAGES.LIBRARY_SORT_ASC,
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      },
    ],
  },
  {
    group: MESSAGES.LIBRARY_SORT_TITLE,
    items: [
      {
        value: "title-asc",
        label: MESSAGES.LIBRARY_SORT_ASC,
        icon: <ArrowUpAZ className="h-3.5 w-3.5" aria-hidden="true" />,
      },
      {
        value: "title-desc",
        label: MESSAGES.LIBRARY_SORT_DESC,
        icon: <ArrowDownAZ className="h-3.5 w-3.5" aria-hidden="true" />,
      },
    ],
  },
];

/**
 * The all-docs page (AFFI NE Explorer equivalent): fixed header with the
 * workspace's note count, sort menu and New note, the filter bar (with the
 * active tag chip), and the virtualized note list as the page's only
 * scrolling body.
 */
export const LibraryPage: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNoteStore((s) => s.notes);
  const createNote = useNoteStore((s) => s.createNote);
  const tags = useTagStore((s) => s.tags);
  const activeTagId = useTagStore((s) => s.activeTagId);
  const setTagFilter = useTagStore((s) => s.setTagFilter);
  const [sort, setSort] = useState<LibrarySort>(() => {
    const stored = localStorage.getItem(SORT_KEY) ?? "";
    return isLibrarySort(stored) ? stored : "updated-desc";
  });

  const activeTag = tags.find((t) => t.id === activeTagId);
  const workspaceTotal = notes.filter((n) => n.workspaceId === activeWorkspaceId).length;

  const chooseSort = (next: LibrarySort) => {
    setSort(next);
    localStorage.setItem(SORT_KEY, next);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b bg-background/50">
        <div className="mx-auto w-full max-w-4xl px-6 pt-8 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
                {MESSAGES.LIBRARY_PAGE_TITLE}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-mono">{workspaceTotal}</span> {MESSAGES.NOTES_HEADER}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" aria-label={MESSAGES.LIBRARY_SORT_LABEL}>
                    {MESSAGES.LIBRARY_SORT_LABEL}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {SORT_OPTIONS.map((group, groupIndex) => (
                    <div key={group.group}>
                      {groupIndex > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuLabel>{group.group}</DropdownMenuLabel>
                      {group.items.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onSelect={() => chooseSort(option.value)}
                        >
                          {option.icon}
                          <span className="flex-1">{option.label}</span>
                          {sort === option.value && (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                aria-label={MESSAGES.CREATE_NEW_NOTE}
                onClick={() => {
                  if (activeWorkspaceId) createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{MESSAGES.CREATE_NEW_NOTE}</span>
              </Button>
            </div>
          </div>

          {activeTag && (
            <div
              className={cn(
                "mt-3 flex items-center justify-between gap-1 rounded-md border bg-card px-2 py-1",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-foreground">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: activeTag.color }}
                />
                <span className="truncate">{activeTag.name}</span>
              </span>
              <button
                type="button"
                aria-label={MESSAGES.TAG_FILTER_CLEAR}
                onClick={() => void setTagFilter(null)}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="mt-3">
            <FilterBar />
          </div>
        </div>
      </div>

      <LibraryNoteList sort={sort} />
    </div>
  );
};
