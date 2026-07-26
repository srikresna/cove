import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { Text } from "@blocksuite/affine/store";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import { vaultService } from "../../../di/container";
import { applySnapshot } from "../../../services/editor/yjsCodec";

type CoveDoc = NonNullable<ReturnType<TestWorkspace["getDoc"]>>;

let viewManager: ViewExtensionManager | null = null;
let workspace: TestWorkspace | null = null;
const initializedDocs = new Set<string>();

export function getViewManager(): ViewExtensionManager {
  if (!viewManager) {
    viewManager = new ViewExtensionManager(getInternalViewExtensions());
  }
  return viewManager;
}

function getWorkspace(): TestWorkspace {
  if (!workspace) {
    const storeManager = new StoreExtensionManager(getInternalStoreExtensions());
    workspace = new TestWorkspace({ id: "cove" });
    workspace.storeExtensions = storeManager.get("store");
    workspace.meta.initialize();
  }
  return workspace;
}

/**
 * One BlockSuite doc per Cove note. The in-memory doc is the source of truth
 * once opened; a persisted snapshot only seeds the first load.
 */
export function openNoteDoc(noteId: string, snapshotB64: string | null): CoveDoc {
  const ws = getWorkspace();
  const doc = ws.getDoc(noteId) ?? ws.createDoc(noteId);
  if (!initializedDocs.has(noteId)) {
    if (snapshotB64) {
      doc.load();
      applySnapshot(doc.spaceDoc, snapshotB64);
    } else {
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
}

vaultService.onLock(resetEngine);
