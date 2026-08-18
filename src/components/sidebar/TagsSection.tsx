import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useTagStore } from "../../store/useTagStore";

const OPEN_KEY = "cove-tags-open";

export const TagsSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(OPEN_KEY) !== "false");
  const tags = useTagStore((s) => s.tags);
  const activeTagId = useTagStore((s) => s.activeTagId);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const setTagFilter = useTagStore((s) => s.setTagFilter);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  if (tags.length === 0) return null;

  const toggleOpen = () => {
    const next = !isOpen;
    localStorage.setItem(OPEN_KEY, String(next));
    setIsOpen(next);
  };

  return (
    <div className="space-y-1 pb-2">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-1 rounded px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        )}
        {MESSAGES.TAGS_HEADER}
      </button>

      {isOpen && (
        <div className="space-y-0.5">
          {tags.map((tag) => {
            const isActive = tag.id === activeTagId;
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setTagFilter(tag.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-border bg-card font-medium text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="truncate">{tag.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
