import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Plus, Check, Trash2 } from 'lucide-react'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'

export const WorkspaceSwitcher: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    setCreateModalOpen,
    deleteWorkspace
  } = useWorkspaceStore()

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between p-2.5 rounded-[12px] bg-cream-paper border-[1.5px] border-charcoal shadow-card-subtle hover:scale-[1.01] transition-transform duration-200 group outline-none"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-8 h-8 rounded-[8px] border border-charcoal flex items-center justify-center text-lg shadow-sm flex-shrink-0"
              style={{ backgroundColor: `${activeWorkspace?.color || '#ff6f1e'}25` }}
            >
              {activeWorkspace?.emoji || '🚀'}
            </div>
            <div className="text-left truncate min-w-0">
              <div className="text-xs font-extrabold text-cocoa-ink truncate">
                {activeWorkspace?.name || 'Workspace'}
              </div>
              <div className="text-[10px] font-medium tracking-tight text-slate-500 truncate">
                {activeWorkspace?.description || 'WORKSPACE'}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-charcoal transition-transform duration-200 flex-shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          className="z-50 w-64 rounded-[16px] bg-cream-paper border-[1.5px] border-charcoal shadow-card-subtle p-2 space-y-1 outline-none"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-marker-orange">
            Switch Workspace
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId
              return (
                <DropdownMenu.Item
                  key={ws.id}
                  onSelect={() => setActiveWorkspace(ws.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-[10px] cursor-pointer outline-none border-[1.5px] transition-all ${
                    isActive
                      ? 'bg-dew-drop border-charcoal text-cocoa-ink font-bold'
                      : 'border-transparent hover:bg-dew-drop text-charcoal'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left truncate min-w-0">
                    <span className="text-base flex-shrink-0">{ws.emoji}</span>
                    <div className="truncate min-w-0">
                      <div className="text-xs truncate">{ws.name}</div>
                      {ws.description && (
                        <div className="text-[9px] text-slate-400 font-normal truncate">
                          {ws.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isActive && <Check className="w-4 h-4 text-marker-orange" />}
                    {workspaces.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWorkspace(ws.id)
                        }}
                        title="Delete Workspace"
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </DropdownMenu.Item>
              )
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-200">
            <DropdownMenu.Item
              onSelect={() => setCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal text-xs font-bold transition-transform hover:scale-105 shadow-paper-lift cursor-pointer outline-none"
            >
              <Plus className="w-4 h-4 text-marker-orange" />
              <span>Create Workspace</span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
