import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  ListTodo, 
  List, 
  ListOrdered, 
  Quote, 
  Code2, 
  Highlighter 
} from 'lucide-react'
import { SlashCommandService } from '../../services/SlashCommandService'

export interface SlashMenuItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: string
}

interface SlashMenuProps {
  editor: any
  isOpen: boolean
  position: { top: number; left: number }
  query?: string
  onClose: () => void
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ editor, isOpen, position, query = '', onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const items: SlashMenuItem[] = [
    {
      id: 'paragraph',
      title: 'Text',
      description: 'Just start writing with plain text.',
      icon: <Type className="w-4 h-4 text-charcoal" />,
      type: 'paragraph'
    },
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: <Heading1 className="w-4 h-4 text-marker-orange" />,
      type: 'h1'
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: <Heading2 className="w-4 h-4 text-marker-orange" />,
      type: 'h2'
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: <Heading3 className="w-4 h-4 text-marker-orange" />,
      type: 'h3'
    },
    {
      id: 'todo',
      title: 'To-Do Checklist',
      description: 'Track tasks with a checkable list.',
      icon: <ListTodo className="w-4 h-4 text-sticker-sprout" />,
      type: 'todo'
    },
    {
      id: 'bullet',
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: <List className="w-4 h-4 text-sticker-sky" />,
      type: 'bullet'
    },
    {
      id: 'number',
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: <ListOrdered className="w-4 h-4 text-charcoal" />,
      type: 'number'
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Capture a quote or highlight idea.',
      icon: <Quote className="w-4 h-4 text-sticker-bubblegum" />,
      type: 'quote'
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Display code with syntax styling.',
      icon: <Code2 className="w-4 h-4 text-charcoal" />,
      type: 'code'
    },
    {
      id: 'highlight',
      title: 'Highlight',
      description: 'Mark text with a marker orange pop.',
      icon: <Highlighter className="w-4 h-4 text-marker-orange" />,
      type: 'highlight'
    }
  ]

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const executeItem = (type: string) => {
    SlashCommandService.applyCommand(editor, type)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          executeItem(filteredItems[selectedIndex].type)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, selectedIndex, filteredItems, editor, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999
        }}
        className="w-72 max-h-80 overflow-y-auto rounded-[16px] bg-cream-paper border-[1.5px] border-charcoal shadow-card-subtle p-2"
      >
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-marker-orange">
            Slash Commands
          </span>
          {query && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dew-drop text-charcoal font-semibold">
              /{query}
            </span>
          )}
        </div>

        <div className="space-y-1 mt-1.5">
          {filteredItems.map((item, index) => {
            const isSelected = index === selectedIndex
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => executeItem(item.type)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-left transition-all duration-150 border-[1.5px] ${
                  isSelected
                    ? 'bg-dew-drop border-charcoal text-cocoa-ink translate-x-1 font-semibold'
                    : 'border-transparent hover:bg-slate-100/60 text-charcoal'
                }`}
              >
                <div className="p-1.5 rounded-[8px] bg-cream-paper border border-charcoal/30">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-cocoa-ink">{item.title}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
          {filteredItems.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              No slash command matching "/{query}"
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
