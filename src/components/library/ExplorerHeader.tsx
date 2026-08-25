import {
  ChevronDown,
  FileDown,
  FileText,
  LayoutGrid,
  List,
  Plus,
  Shapes,
  Waves,
} from "lucide-react";
import type React from "react";
import { MESSAGES } from "../../constants/messages";
import type { PropertyDefinition } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DisplayMenu, type LibraryDisplayPrefs } from "./DisplayMenu";
import type { LibrarySort } from "./LibraryNoteList";

export type LibraryTab = "docs" | "collections" | "tags";
export type LibraryViewMode = "list" | "grid" | "masonry";

const NAV_ITEMS: Array<{ value: LibraryTab; label: string }> = [
  { value: "docs", label: MESSAGES.LIBRARY_NAV_DOCS },
  { value: "collections", label: MESSAGES.LIBRARY_NAV_COLLECTIONS },
  { value: "tags", label: MESSAGES.LIBRARY_NAV_TAGS },
];

const VIEW_MODES: Array<{ value: LibraryViewMode; label: string; icon: React.ReactNode }> = [
  {
    value: "masonry",
    label: MESSAGES.LIBRARY_VIEW_MASONRY,
    icon: <Waves className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "grid",
    label: MESSAGES.LIBRARY_VIEW_GRID,
    icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "list",
    label: MESSAGES.LIBRARY_VIEW_LIST,
    icon: <List className="h-4 w-4" aria-hidden="true" />,
  },
];

interface ExplorerHeaderProps {
  tab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  viewMode: LibraryViewMode;
  onViewModeChange: (mode: LibraryViewMode) => void;
  prefs: LibraryDisplayPrefs;
  onPrefsChange: (next: Partial<LibraryDisplayPrefs>) => void;
  orderBy: LibrarySort;
  onOrderByChange: (next: LibrarySort) => void;
  defs: PropertyDefinition[];
  onNewNote: () => void;
  onNewEdgeless: () => void;
  onImportMarkdown: () => void;
}

/**
 * AFFI NE all-docs header: one 52px bar — Docs/Collections/Tags navigation
 * on the left (18px semibold text links), view-mode toggle + Display menu +
 * split New dropdown on the right. Tab-scoped controls only render on Docs.
 */
export const ExplorerHeader: React.FC<ExplorerHeaderProps> = ({
  tab,
  onTabChange,
  viewMode,
  onViewModeChange,
  prefs,
  onPrefsChange,
  orderBy,
  onOrderByChange,
  defs,
  onNewNote,
  onNewEdgeless,
  onImportMarkdown,
}) => (
  <div className="flex h-[52px] shrink-0 items-center justify-between border-b px-4">
    <nav className="flex items-center gap-3 pl-2" aria-label="Library sections">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-current={tab === item.value ? "page" : undefined}
          onClick={() => onTabChange(item.value)}
          className={cn(
            "rounded-md text-lg font-semibold leading-[26px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            tab === item.value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>

    {tab === "docs" && (
      <div className="flex items-center gap-4">
        {/* View toggle (AFFI NE naked RadioGroup: three 24px icon buttons,
            active gets the hover overlay). */}
        <div className="flex items-center gap-1" role="group" aria-label="View mode">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              aria-label={mode.label}
              aria-pressed={viewMode === mode.value}
              onClick={() => onViewModeChange(mode.value)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                viewMode === mode.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        <DisplayMenu
          prefs={prefs}
          onChange={onPrefsChange}
          orderBy={orderBy}
          onOrderByChange={onOrderByChange}
          defs={defs}
          viewMode={viewMode}
        />

        {/* Split New dropdown: main click creates a note, chevron opens the
            menu (AFFI NE PageListNewPageButton shape). */}
        <div className="flex items-stretch">
          <Button
            size="sm"
            className="h-7 gap-1 rounded-r-none border-r-0 px-3 text-xs font-semibold"
            onClick={onNewNote}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {MESSAGES.CREATE_NEW_NOTE}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More create options"
                className="flex h-7 items-center rounded-l-none rounded-lg border px-1.5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem onSelect={onNewNote} className="flex-col items-start gap-0.5 py-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {MESSAGES.CREATE_NEW_NOTE}
                </span>
                <span className="pl-7 text-xs text-muted-foreground">
                  {MESSAGES.LIBRARY_NEW_NOTE_DESC}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onNewEdgeless}
                className="flex-col items-start gap-0.5 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Shapes className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {MESSAGES.LIBRARY_NEW_EDGELESS}
                </span>
                <span className="pl-7 text-xs text-muted-foreground">
                  {MESSAGES.LIBRARY_NEW_EDGELESS_DESC}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onImportMarkdown}
                className="flex-col items-start gap-0.5 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FileDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {MESSAGES.LIBRARY_IMPORT_MD}
                </span>
                <span className="pl-7 text-xs text-muted-foreground">
                  {MESSAGES.LIBRARY_IMPORT_MD_DESC}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )}
  </div>
);
