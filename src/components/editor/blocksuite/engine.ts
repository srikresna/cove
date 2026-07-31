import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { FeatureFlagService } from "@blocksuite/affine/shared/services";
import { Text } from "@blocksuite/affine/store";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import { blobSource, noteService, vaultService } from "../../../di/container";
import { unpackBlockSuiteContent } from "../../../services/editor/contentFormat";
import { applySnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";

// Register the affine-editor-container web component (NOT a block/widget
// extension — it's the editor container itself). Block/widget custom elements
// are registered by the extension framework's effect() calls during
// ViewExtensionManager.get(mode), which happens automatically.
import { effects as registerEditorContainer } from "@blocksuite/integration-test/effects";
registerEditorContainer();

type CoveDoc = NonNullable<ReturnType<TestWorkspace["getDoc"]>>;

let viewManager: ViewExtensionManager | null = null;
let workspace: TestWorkspace | null = null;
const initializedDocs = new Set<string>();
// IDs of docs Cove opened itself (vs BlockSuite-initiated "new doc" creates).
const coveOwnedDocIds = new Set<string>();

/**
 * Registers existing Cove notes in the BlockSuite workspace with their titles so
 * the @-mention / linked-doc popover can find them by name.
 */
export function registerExistingNotes(notes: Array<{ id: string; title: string }>): void {
  const ws = workspace;
  if (!ws) return;
  for (const { id, title } of notes) {
    if (coveOwnedDocIds.has(id)) continue;
    if (ws.getDoc(id)) continue;
    coveOwnedDocIds.add(id);
    // Create the doc WITH the title set on the page block — this is what the
    // linked-doc search reads. Without a title, all notes show "Untitled".
    const doc = ws.createDoc(id);
    doc.load(() => {
      const store = doc.getStore();
      const rootId = store.addBlock("affine:page", { title: new Text(title) });
      store.addBlock("affine:surface", {}, rootId);
      const noteBlockId = store.addBlock("affine:note", {}, rootId);
      store.addBlock("affine:paragraph", {}, noteBlockId);
    });
    doc.getStore().resetHistory();
  }
}

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
      // Read the title BlockSuite assigned to the new doc (user typed it in the
      // @-popover / slash-menu "Create doc" input).
      const meta = workspace?.meta.getDocMeta(docId);
      const title = meta?.title ?? undefined;
      try {
        await noteService.createNoteWithId(activeWs, docId, title);
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
    const store = doc.getStore();
    const hasExistingBlocks = store.rootIds.length > 0;
    if (snapshotB64) {
      // Real BlockSuite content from DB — apply it (overwrites any placeholder blocks).
      doc.load();
      applySnapshot(doc.spaceDoc, snapshotB64);
    } else if (!hasExistingBlocks) {
      // No content AND no existing blocks — create default structure.
      doc.load(() => {
        const rootId = store.addBlock("affine:page", { title: new Text() });
        store.addBlock("affine:surface", {}, rootId);
        const noteBlockId = store.addBlock("affine:note", {}, rootId);
        store.addBlock("affine:paragraph", {}, noteBlockId);
      });
    }
    // else: doc has placeholder blocks from registerExistingNotes (title + paragraph) — keep as-is.
    doc.getStore().resetHistory();
    // Enable the feature flag that controls drag handle + add-block visibility.
    // Set AFTER doc initialization to avoid interfering with block seeding.
    try {
      doc.getStore().get(FeatureFlagService).setFlag("enable_advanced_block_visibility", true);
    } catch {
      // FeatureFlagService might not be available for some doc types.
    }
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
