import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { MESSAGES } from "../../../constants/messages";
import { propertyService } from "../../../di/container";
import type { Note } from "../../../domain/note/Note";
import type {
  PropertyDefinition,
  PropertyType,
  PropertyValue,
  PropertyVisibility,
} from "../../../domain/property/Property";
import {
  CREATABLE_PROPERTY_TYPES,
  hasOptions,
  isSystemPropertyId,
  JOURNAL_PROPERTY_ID,
} from "../../../domain/property/Property";
import { notifyError } from "../../../store/notify";
import { usePropertyStore } from "../../../store/usePropertyStore";
import { useViewStore } from "../../../store/useViewStore";
import { ConfirmDialog } from "../../modals/ConfirmDialog";
import {
  PROPERTY_TYPE_META,
  PROPERTY_VALUE_EDITORS,
  resolvePropertyIcon,
} from "../PropertyValueEditors";
import { PropertyRow } from "./PropertyRow";
import {
  DocModeValue,
  EdgelessThemeValue,
  PageWidthValue,
  TemplateValue,
} from "./SegmentedValueCells";
import { DateValue, JournalValue, TagsValue, WorkspaceValue } from "./SystemValueCells";

export { TagChip } from "./TagChip";
export { PROPERTY_TYPE_META };

export const NotePropertiesRows: React.FC<{ note: Note }> = ({ note }) => {
  const [definitions, setDefinitions] = useState<PropertyDefinition[]>([]);
  const [values, setValues] = useState<Map<string, PropertyValue>>(new Map());
  const [deletingDef, setDeletingDef] = useState<PropertyDefinition | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  // A freshly created property stays visible on this note until it gains a
  // value, so the user always has a row through which to set one.
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const propertyVersion = usePropertyStore((s) => s.version);

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  const reload = useCallback(() => {
    Promise.all([propertyService.listDefinitions(), propertyService.valuesForNote(note.id)])
      .then(([defs, vals]) => {
        setDefinitions(defs);
        setValues(vals);
      })
      .catch(notifyError);
  }, [note.id, propertyVersion]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = (propertyId: string, value: PropertyValue) => {
    setValues((prev) => new Map(prev).set(propertyId, value));
    return propertyService.setValue(note.id, propertyId, value).catch((err) => {
      notifyError(err);
      reload();
    });
  };

  const clear = (propertyId: string) => {
    setValues((prev) => {
      const next = new Map(prev);
      next.delete(propertyId);
      return next;
    });
    propertyService.removeValue(note.id, propertyId).catch((err) => {
      notifyError(err);
      reload();
    });
  };

  const createDefinition = (type: PropertyType) => {
    const name = newName.trim() || PROPERTY_TYPE_META[type].label;
    setNewName("");
    propertyService
      .createDefinition(name, type)
      .then((def) => {
        setJustCreatedId(def.id);
      })
      .catch(notifyError);
  };

  const createOption = (
    def: PropertyDefinition,
    name: string,
    thenPick: boolean,
    color?: string,
  ) => {
    propertyService
      .addOption(def.id, name, color)
      .then(async (option) => {
        if (!thenPick) return;
        const current = values.get(def.id);
        if (def.type === "multiSelect") {
          const ids = current?.type === "multiSelect" ? current.optionIds : [];
          await save(def.id, { type: "multiSelect", optionIds: [...ids, option.id] });
        } else {
          await save(def.id, { type: def.type as "select" | "status", optionId: option.id });
        }
      })
      .catch(notifyError);
  };

  const handleReorder = useCallback(
    (id: string, targetId: string, position: "before" | "after") => {
      setDefinitions((prev) => {
        const from = prev.findIndex((d) => d.id === id);
        const to = prev.findIndex((d) => d.id === targetId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        if (!moved) return prev;
        const insertAt =
          position === "before" ? (from < to ? to - 1 : to) : from < to ? to : to + 1;
        next.splice(insertAt, 0, moved);
        return next;
      });
      propertyService.reorderDefinition(id, targetId, position).catch((err) => {
        notifyError(err);
        reload();
      });
    },
    [reload],
  );

  const commitRename = (def: PropertyDefinition, name: string) => {
    setRenamingId(null);
    if (name === def.name) return;
    propertyService.renameDefinition(def.id, name).catch((err) => {
      notifyError(err);
      reload();
    });
  };

  const handleVisibility = (def: PropertyDefinition, show: PropertyVisibility) => {
    propertyService.setDefinitionVisibility(def.id, show).catch((err) => {
      notifyError(err);
      reload();
    });
  };

  const handleIcon = (def: PropertyDefinition, icon: string | null) => {
    propertyService.setDefinitionIcon(def.id, icon).catch((err) => {
      notifyError(err);
      reload();
    });
  };

  useEffect(() => {
    if (justCreatedId && values.has(justCreatedId)) setJustCreatedId(null);
  }, [values, justCreatedId]);

  const isVisible = (def: PropertyDefinition): boolean => {
    if (def.id === justCreatedId) return true;
    if (def.show === "always-hide") return false;
    if (def.show !== "hide-when-empty") return true;
    // Value-backed rows check note_properties; note-field-backed rows check
    // their note field instead.
    if (def.id === "system:edgeless-theme") return note.edgelessTheme !== undefined;
    if (def.id === "system:template") return note.isTemplate === true;
    return values.has(def.id);
  };

  const visibleDefinitions = definitions.filter(isVisible);
  const hiddenDefinitions = definitions.filter((def) => !isVisible(def));

  const renderValue = (def: PropertyDefinition) => {
    const value = values.get(def.id);
    if (def.id === JOURNAL_PROPERTY_ID) {
      return (
        <JournalValue
          noteId={note.id}
          value={value?.type === "date" ? value : undefined}
          onSet={(timestamp) => save(def.id, { type: "date", timestamp })}
          onClear={() => clear(def.id)}
        />
      );
    }
    switch (def.id) {
      case "system:doc-mode":
        return <DocModeValue note={note} />;
      case "system:page-width":
        return <PageWidthValue note={note} />;
      case "system:edgeless-theme":
        return <EdgelessThemeValue note={note} />;
      case "system:template":
        return <TemplateValue note={note} />;
    }
    switch (def.type) {
      case "tags":
        return <TagsValue noteId={note.id} workspaceId={note.workspaceId} />;
      case "workspace":
        return <WorkspaceValue note={note} />;
      case "created":
        return <DateValue timestamp={note.createdAt} />;
      case "updated":
        return <DateValue timestamp={note.updatedAt} />;
    }
    const Editor = PROPERTY_VALUE_EDITORS[def.type];
    if (!Editor) return null;
    return (
      <Editor
        def={def}
        value={value}
        noteId={note.id}
        onSet={(next) => save(def.id, next)}
        onClear={() => clear(def.id)}
        createOption={createOption}
      />
    );
  };

  return (
    <>
      {visibleDefinitions.map((def) => (
        <PropertyRow
          key={def.id}
          def={def}
          renaming={renamingId === def.id}
          onStartRename={setRenamingId}
          onCommitRename={commitRename}
          onCancelRename={() => setRenamingId(null)}
          onVisibility={handleVisibility}
          onIcon={handleIcon}
          onDelete={setDeletingDef}
          onReorder={handleReorder}
        >
          {renderValue(def)}
        </PropertyRow>
      ))}

      {hiddenDefinitions.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-[26px] w-full items-center gap-1.5 rounded p-1 text-xs text-muted-foreground/80 transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.PROP_HIDDEN_COUNT.replace("{n}", String(hiddenDefinitions.length))}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-2">
            <div className="max-h-56 space-y-0.5 overflow-y-auto">
              {hiddenDefinitions.map((def) => (
                <div
                  key={def.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
                  >
                    {resolvePropertyIcon(def)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{def.name}</span>
                  <button
                    type="button"
                    aria-label={MESSAGES.PROP_VIS_ALWAYS_SHOW}
                    title={MESSAGES.PROP_VIS_ALWAYS_SHOW}
                    onClick={() => handleVisibility(def, "always-show")}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {!isSystemPropertyId(def.id) && (
                    <button
                      type="button"
                      aria-label={MESSAGES.PROP_DELETE}
                      title={MESSAGES.PROP_DELETE}
                      onClick={() => setDeletingDef(def)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Popover onOpenChange={(open) => !open && setNewName("")}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-[30px] w-full items-center gap-1.5 rounded p-1 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {MESSAGES.PROP_ADD}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={MESSAGES.PROP_NAME_PLACEHOLDER}
            className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="grid max-h-56 grid-cols-1 gap-0.5 overflow-y-auto">
            {CREATABLE_PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => createDefinition(type)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-muted-foreground"
              >
                {PROPERTY_TYPE_META[type].icon}
                <span>{PROPERTY_TYPE_META[type].label}</span>
                {hasOptions(type) && (
                  <span className="ml-auto text-[10px] uppercase leading-4 text-muted-foreground">
                    {MESSAGES.PROP_OPTIONS_BADGE}
                  </span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        open={deletingDef !== null}
        title={MESSAGES.PROP_DELETE_CONFIRM_TITLE}
        description={`"${deletingDef?.name ?? ""}" — ${MESSAGES.PROP_DELETE_CONFIRM_DESC}`}
        confirmLabel={MESSAGES.PROP_DELETE}
        danger
        onConfirm={() => {
          if (deletingDef) {
            propertyService
              .deleteDefinition(deletingDef.id)
              .then(async () => {
                // Saved views may filter on the deleted definition; prune
                // their rules so no view silently goes empty or undead.
                await useViewStore.getState().syncAfterPropertyDelete(deletingDef.id);
              })
              .catch(notifyError);
          }
          setDeletingDef(null);
        }}
        onCancel={() => setDeletingDef(null)}
      />
    </>
  );
};
