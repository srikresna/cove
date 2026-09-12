import type React from "react";
import { useCallback } from "react";
import { MESSAGES } from "../../../constants/messages";
import { propertyService } from "../../../di/container";
import type { PropertyDefinition, PropertyVisibility } from "../../../domain/property/Property";
import { notifyError } from "../../../store/notify";
import { useViewStore } from "../../../store/useViewStore";
import { ConfirmDialog } from "../../modals/ConfirmDialog";

export const VISIBILITY_LABEL: Record<PropertyVisibility, string> = {
  "always-show": MESSAGES.PROP_VIS_ALWAYS_SHOW,
  "hide-when-empty": MESSAGES.PROP_VIS_HIDE_WHEN_EMPTY,
  "always-hide": MESSAGES.PROP_VIS_ALWAYS_HIDE,
};

export interface PropertyDefinitionActions {
  handleReorder: (id: string, targetId: string, position: "before" | "after") => void;
  commitRename: (def: PropertyDefinition, name: string) => void;
  handleVisibility: (def: PropertyDefinition, show: PropertyVisibility) => void;
  handleIcon: (def: PropertyDefinition, icon: string | null) => void;
  deleteDefinition: (def: PropertyDefinition) => void;
}

export function usePropertyDefinitionActions({
  setDefinitions,
  setRenamingId,
  reload,
}: {
  setDefinitions: React.Dispatch<React.SetStateAction<PropertyDefinition[]>>;
  setRenamingId: (id: string | null) => void;
  reload: () => void;
}): PropertyDefinitionActions {
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
    [setDefinitions, reload],
  );

  const commitRename = useCallback(
    (def: PropertyDefinition, name: string) => {
      setRenamingId(null);
      if (name === def.name) return;
      propertyService.renameDefinition(def.id, name).catch((err) => {
        notifyError(err);
        reload();
      });
    },
    [setRenamingId, reload],
  );

  const handleVisibility = useCallback(
    (def: PropertyDefinition, show: PropertyVisibility) => {
      propertyService.setDefinitionVisibility(def.id, show).catch((err) => {
        notifyError(err);
        reload();
      });
    },
    [reload],
  );

  const handleIcon = useCallback(
    (def: PropertyDefinition, icon: string | null) => {
      propertyService.setDefinitionIcon(def.id, icon).catch((err) => {
        notifyError(err);
        reload();
      });
    },
    [reload],
  );

  const deleteDefinition = useCallback((def: PropertyDefinition) => {
    propertyService
      .deleteDefinition(def.id)
      .then(async () => {
        await useViewStore.getState().syncAfterPropertyDelete(def.id);
      })
      .catch(notifyError);
  }, []);

  return { handleReorder, commitRename, handleVisibility, handleIcon, deleteDefinition };
}

export const DeletePropertyDefinitionDialog: React.FC<{
  target: PropertyDefinition | null;
  onClose: () => void;
  onDelete: (def: PropertyDefinition) => void;
}> = ({ target, onClose, onDelete }) => (
  <ConfirmDialog
    open={target !== null}
    title={MESSAGES.PROP_DELETE_CONFIRM_TITLE}
    description={`"${target?.name ?? ""}" — ${MESSAGES.PROP_DELETE_CONFIRM_DESC}`}
    confirmLabel={MESSAGES.PROP_DELETE}
    danger
    onConfirm={() => {
      if (target) onDelete(target);
      onClose();
    }}
    onCancel={onClose}
  />
);
