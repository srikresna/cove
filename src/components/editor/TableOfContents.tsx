import { AlignLeft, ListFilter } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

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
      <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-dew-drop border border-charcoal">
        <div className="flex items-center gap-2 text-xs font-bold text-cocoa-ink">
          <AlignLeft className="w-4 h-4 text-marker-orange" />
          <span>Table of Contents ({items.length})</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md hover:bg-cream-paper text-charcoal transition-colors"
        >
          <ListFilter className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 p-2 rounded-[12px] bg-cream-paper border border-charcoal shadow-sm space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToHeading(item.id)}
              className="w-full text-left px-2 py-1 rounded-[6px] hover:bg-dew-drop text-xs text-charcoal font-medium truncate transition-colors flex items-center gap-2"
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-marker-orange flex-shrink-0" />
              <span className="truncate">{item.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
