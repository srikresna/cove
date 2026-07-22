import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, ChevronRight, ListOrdered } from 'lucide-react'

export interface TocItem {
  id: string
  text: string
  level: number
  element: Element
}

interface TableOfContentsProps {
  editorRef: React.RefObject<HTMLDivElement | null>
  contentHtml: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editorRef, contentHtml }) => {
  const [items, setItems] = useState<TocItem[]>([])
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (!editorRef.current) return

    const headings = editorRef.current.querySelectorAll('h1, h2, h3')
    const tocItems: TocItem[] = []

    headings.forEach((heading, idx) => {
      const level = parseInt(heading.tagName.replace('H', ''), 10)
      const text = heading.textContent || 'Untitled Heading'
      const id = `toc-heading-${idx}`
      heading.setAttribute('id', id)

      tocItems.push({
        id,
        text,
        level,
        element: heading
      })
    })

    setItems(tocItems)
  }, [contentHtml, editorRef])

  if (items.length === 0) return null

  const handleScrollToHeading = (item: TocItem) => {
    item.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="fixed top-20 right-6 z-40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-cocoa-ink text-xs font-bold shadow-paper-lift hover:scale-105 transition-transform"
      >
        <ListOrdered className="w-3.5 h-3.5 text-marker-orange" />
        <span>Table of Contents ({items.length})</span>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="mt-2 w-64 max-h-80 overflow-y-auto rounded-[16px] bg-cream-paper border-[1.5px] border-charcoal shadow-card-subtle p-3 space-y-1.5"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-marker-orange mb-2 border-b border-charcoal/20 pb-1">
              Document Outline
            </div>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleScrollToHeading(item)}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 6}px` }}
                  className="w-full text-left py-1 px-2 rounded-[8px] hover:bg-dew-drop text-xs font-semibold text-charcoal truncate transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-marker-orange flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
