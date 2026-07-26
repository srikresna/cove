import { AlignLeft, ListFilter } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  contentHtml: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editorRef }) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!editorRef.current) return;

    const headingElements = editorRef.current.querySelectorAll(
      '[data-content-type="heading"], h1, h2, h3',
    );

    const tocItems: TocItem[] = [];

    headingElements.forEach((el, index) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;

      const levelAttr = el.getAttribute("data-level");
      let level = levelAttr ? Number.parseInt(levelAttr, 10) : 1;
      if (Number.isNaN(level)) level = 1;

      const id = el.id || `heading-${index}`;
      el.id = id;

      tocItems.push({ id, text, level });
    });

    setItems(tocItems);
  }, [editorRef]);

  if (items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between rounded-md border bg-card px-2.5 py-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <AlignLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>
            Table of Contents{" "}
            <span className="font-mono text-muted-foreground">({items.length})</span>
          </span>
        </div>

        <Button variant="ghost" size="iconSm" onClick={() => setIsOpen(!isOpen)}>
          <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      {isOpen && (
        <div className="mt-2 space-y-0.5 rounded-md border bg-card p-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToHeading(item.id)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
            >
              <span
                className="h-1 w-1 flex-shrink-0 rounded-full bg-primary/60"
                aria-hidden="true"
              />
              <span className="truncate">{item.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
