import type { DatabaseBlockModel } from "@blocksuite/affine/model";
import { DatabaseBlockDataSource } from "@blocksuite/affine-block-database";
import {
  Calendar,
  CaseSensitive,
  CheckSquare,
  ChevronDown,
  Gauge,
  Hash,
  Link2,
  ListTodo,
  Tag,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { blockSuiteEditorService, noteService } from "../../../../di/container";
import { cn } from "../../../../lib/utils";
import type { DatabaseBacklinkRef } from "../../../../services/blocksuite/IBlockSuiteEditorService";
import { packBlockSuiteContent } from "../../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../../services/editor/yjsCodec";
import { Logger } from "../../../../services/Logger";
import { useNoteStore } from "../../../../store/useNoteStore";
import { Button } from "../../../ui/button";
import { InfoRow } from "../../NoteInfoPanel";

interface BacklinkCell {
  propertyId: string;
  name: string;
  type: string;
  value: string;
  timestamp: number | null;
}

function typeIcon(type: string): React.ReactNode {
  switch (type) {
    case "date":
      return <Calendar />;
    case "number":
      return <Hash />;
    case "select":
    case "multi-select":
      return <Tag />;
    case "checkbox":
      return <CheckSquare />;
    case "progress":
      return <Gauge />;
    case "link":
      return <Link2 />;
    default:
      return <CaseSensitive />;
  }
}

function formatCell(raw: unknown, type: string): string {
  if (raw == null) return "";
  if (typeof raw === "number") {
    if (type === "date") {
      return new Date(raw).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    }
    return raw.toLocaleString();
  }
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === "string" ? v : ""))
      .filter(Boolean)
      .join(", ");
  }
  if (
    typeof raw === "object" &&
    typeof (raw as { toString?: () => string }).toString === "function"
  ) {
    const s = String(raw);
    if (s !== "[object Object]") return s;
  }
  return "";
}

function toLocalInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const DatabaseBacklinkSection: React.FC<DatabaseBacklinkRef & { defaultOpen?: boolean }> = ({
  databaseDocId,
  databaseId,
  databaseRowId,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [rev, setRev] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (blockSuiteEditorService.isNoteDocLoaded(databaseDocId)) return;
    let cancelled = false;
    noteService
      .getNote(databaseDocId)
      .then((n) => {
        if (!cancelled) blockSuiteEditorService.openNoteDoc(databaseDocId, n?.content ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setRev((r) => r + 1);
      });
    return () => {
      cancelled = true;
    };
  }, [databaseDocId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rev intentionally retriggers after in-place cell edits
  const data = useMemo(() => {
    try {
      const store = blockSuiteEditorService.getDocStoreForPeek(databaseDocId);
      if (!store) return null;
      const block = store.getBlock(databaseId);
      const dbModel = block?.model;
      if (dbModel?.flavour !== "affine:database") return null;
      const dbBlockModel = dbModel as unknown as DatabaseBlockModel;

      const ds = new DatabaseBlockDataSource(dbBlockModel);
      const cells: BacklinkCell[] = [];
      for (const propertyId of ds.properties$.value) {
        const type = ds.propertyTypeGet(propertyId) ?? "";
        if (type === "title") continue;
        const raw = ds.cellValueGet(databaseRowId, propertyId);
        cells.push({
          propertyId,
          name: ds.propertyNameGet(propertyId),
          type,
          value: formatCell(raw, type),
          timestamp: type === "date" && typeof raw === "number" ? raw : null,
        });
      }

      cells.sort((a, b) => {
        if (a.type === "date" && b.type !== "date") return -1;
        if (b.type === "date" && a.type !== "date") return 1;
        return 0;
      });
      return { cells, ds };
    } catch {
      return null;
    }
  }, [databaseDocId, databaseId, databaseRowId, rev]);

  const runSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    try {
      if (!blockSuiteEditorService.isNoteDocLoaded(databaseDocId)) return;
      const store = blockSuiteEditorService.getDocStoreForPeek(databaseDocId);
      if (!store) return;
      const snapshot = packBlockSuiteContent(encodeDocSnapshot(store.spaceDoc));
      void useNoteStore.getState().updateNote(databaseDocId, { content: snapshot });
    } catch {
      void 0;
    }
  }, [databaseDocId]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(runSave, 500);
  }, [runSave]);

  useEffect(() => {
    return () => {
      runSave();
    };
  }, [runSave]);

  const handleDateChange = useCallback(
    (cell: BacklinkCell, inputValue: string) => {
      if (!data) return;
      try {
        if (inputValue === "") {
          data.ds.cellValueChange(databaseRowId, cell.propertyId, null);
        } else {
          const ts = new Date(inputValue).getTime();
          if (Number.isNaN(ts)) return;
          data.ds.cellValueChange(databaseRowId, cell.propertyId, ts);
        }
        setRev((r) => r + 1);
        scheduleSave();
      } catch (err) {
        Logger.error("[cove-backlink] date write failed", err);
      }
    },
    [data, databaseRowId, scheduleSave],
  );

  if (!data) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-[30px] w-full items-center justify-between rounded p-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Calendar Properties</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")}
        />
      </button>
      <div className="h-px w-full bg-border" aria-hidden="true" />

      {open && (
        <div className="mt-2 space-y-1 pb-2">
          {data.cells.length === 0 && (
            <div className="p-1 text-sm text-muted-foreground/70">Empty</div>
          )}
          {data.cells.map((cell) => (
            <InfoRow key={cell.propertyId} icon={typeIcon(cell.type)} label={cell.name}>
              {cell.type === "date" ? (
                <input
                  type="datetime-local"
                  value={cell.timestamp != null ? toLocalInputValue(cell.timestamp) : ""}
                  onChange={(e) => handleDateChange(cell, e.target.value)}
                  className="rounded border bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : (
                <span className="px-1 text-foreground/90">{cell.value || "—"}</span>
              )}
            </InfoRow>
          ))}
          <div className="px-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-muted-foreground"
              onClick={() => {
                if (useNoteStore.getState().notes.some((n) => n.id === databaseDocId)) {
                  useNoteStore.getState().setActiveNoteId(databaseDocId);
                }
              }}
            >
              <ListTodo className="h-3.5 w-3.5" aria-hidden="true" />
              Open Calendar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseBacklinkSection;
