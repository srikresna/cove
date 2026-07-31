import "@blocksuite/affine/effects";
import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { Text } from "@blocksuite/affine/store";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import { blobSource, noteService, vaultService } from "../../../di/container";
import { unpackBlockSuiteContent } from "../../../services/editor/contentFormat";
import { applySnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";

type CoveDoc = NonNullable<ReturnType<TestWorkspace["getDoc"]>>;

let viewManager: ViewExtensionManager | null = null;
let workspace: TestWorkspace | null = null;
const initializedDocs = new Set<string>();
// IDs of docs Cove opened itself (vs BlockSuite-initiated "new doc" creates).
const coveOwnedDocIds = new Set<string>();

export function getViewManager(): ViewExtensionManager {
  if (!viewManager) {
    viewManager = new ViewExtensionManager(getInternalViewExtensions());
  }
  return viewManager;
}

function getWorkspace(): TestWorkspace {
  if (!workspace) {
    const storeManager = new StoreExtensionManager(getInternalStoreExtensions());
    workspace = new TestWorkspace({ id: "cove", blobSources: { main: blobSource } });
    workspace.storeExtensions = storeManager.get("store");
    workspace.meta.initialize();
    // Intercept BlockSuite's "new doc" creation (@-popover / slash menu) and
    // sync it to Cove's DB so the note persists + appears in the sidebar.
    workspace.meta.docMetaAdded.subscribe(async (docId: string) => {
      if (coveOwnedDocIds.has(docId)) return; // Cove opened this doc itself
      coveOwnedDocIds.add(docId);
      const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
      if (!activeWs) return;
      try {
        await noteService.createNoteWithId(activeWs, docId);
        await useNoteStore.getState().fetchNotes(activeWs);
      } catch {
        // Best-effort: if DB sync fails, the doc still exists in-memory.
      }
    });
  }
  return workspace;
}

/**
 * One BlockSuite doc per Cove note. The in-memory doc is the source of truth
 * once opened; a persisted snapshot only seeds the first load.
 */
export function openNoteDoc(noteId: string, content: string): CoveDoc {
  const ws = getWorkspace();
  coveOwnedDocIds.add(noteId);
  const doc = ws.getDoc(noteId) ?? ws.createDoc(noteId);
  if (!initializedDocs.has(noteId)) {
    const snapshotB64 = unpackBlockSuiteContent(content);
    if (snapshotB64) {
      doc.load();
      applySnapshot(doc.spaceDoc, snapshotB64);
    } else {
      // Non-envelope content (a brand-new note, or a pre-BlockSuite note): seed
      // an empty BlockSuite doc. The first save writes the real snapshot.
      const store = doc.getStore();
      doc.load(() => {
        const rootId = store.addBlock("affine:page", { title: new Text() });
        store.addBlock("affine:surface", {}, rootId);
        const noteBlockId = store.addBlock("affine:note", {}, rootId);
        store.addBlock("affine:paragraph", {}, noteBlockId);
      });
    }
    doc.getStore().resetHistory();
    initializedDocs.add(noteId);
  }
  return doc;
}

// Decrypted note content lives inside these Y docs, so they must die with the
// session key.
function resetEngine(): void {
  workspace?.dispose();
  workspace = null;
  initializedDocs.clear();
  coveOwnedDocIds.clear();
}

vaultService.onLock(resetEngine);
