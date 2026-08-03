import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { FoundationViewExtension } from "@blocksuite/affine/foundation/view";
import { FeatureFlagService } from "@blocksuite/affine/shared/services";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import type { BlobSource } from "@blocksuite/sync";
import { effects as registerEditorContainer } from "@blocksuite/integration-test/effects";
import { unpackBlockSuiteContent } from "../editor/contentFormat";
import {
  type BlockSuiteDoc,
  type BlockSuiteStore,
  normalizeBlockTree,
  seedDefaultBlocks,
} from "../editor/BlockTreeNormalizer";
import { applySnapshot } from "../editor/yjsCodec";
import {
  type CanvasPrefs,
  DEFAULT_CANVAS_PREFS,
  type IBlockSuiteEditorService,
} from "./IBlockSuiteEditorService";
import { covePeekViewService } from "./peekViewService";

interface BlockSuiteEditorServiceDeps {
  /** Persistent BlobSource backing BlockSuite blob storage. */
  blobSource: BlobSource;
}

/**
 * Manages the single BlockSuite workspace that backs every Cove note editor.
 *
 * This is the service extracted from the old `engine.ts` god-module. It owns
 * workspace/view-manager lifecycle and the Cove-note ↔ BlockSuite-doc mapping,
 * and is intentionally free of zustand imports: the two pieces of UI state it
 * needs (canvas feature flags and new-doc DB sync) are injected by the store
 * layer via {@link provideCanvasPrefs} / {@link provideDocCreatedHandler}.
 */
export class BlockSuiteEditorService implements IBlockSuiteEditorService {
  private workspace: TestWorkspace | null = null;
  private viewManager: ViewExtensionManager | null = null;
  // Doc ids that have been fully loaded (snapshot applied + normalized).
  private readonly initializedDocs = new Set<string>();
  // Doc ids Cove opened itself (vs BlockSuite-initiated "new doc" creates).
  private readonly coveOwnedDocIds = new Set<string>();
  // Doc ids registered as lightweight metadata (for @-mention search), tracked
  // so they can be pruned on workspace switch.
  private readonly registeredMetaIds = new Set<string>();

  private canvasPrefsProvider: () => CanvasPrefs = () => DEFAULT_CANVAS_PREFS;
  private docCreatedHandler: (docId: string, title?: string) => Promise<void> = async () => undefined;

  constructor(private readonly deps: BlockSuiteEditorServiceDeps) {
    // Register the affine-editor-container web component once (NOT a
    // block/widget extension — it's the editor container itself).
    registerEditorContainer();
  }

  getViewManager(): ViewExtensionManager {
    if (!this.viewManager) {
      this.viewManager = new ViewExtensionManager(getInternalViewExtensions());
      // Wire the peek-view service into every editor built from this manager.
      // FoundationViewExtension.setup() registers PeekViewExtension (which
      // di.override's PeekViewProvider with our service) only when peekView is
      // truthy. ViewExtensionManager.get(scope) rebuilds on each call, so this
      // one-time configure is picked up by all subsequent editor mounts — both
      // the main surface and the PeekViewModal.
      this.viewManager.configure(FoundationViewExtension, {
        peekView: covePeekViewService,
      });
    }
    return this.viewManager;
  }

  private getWorkspace(): TestWorkspace {
    if (!this.workspace) {
      const storeManager = new StoreExtensionManager(getInternalStoreExtensions());
      const workspace = new TestWorkspace({ id: "cove", blobSources: { main: this.deps.blobSource } });
      workspace.storeExtensions = storeManager.get("store");
      workspace.meta.initialize();
      workspace.start();
      // Intercept BlockSuite's "new doc" creation (@-popover / slash menu) and
      // sync it to Cove's DB via the injected handler (provided by the note
      // store, which owns noteService + fetchNotes + the active workspace).
      workspace.meta.docMetaAdded.subscribe(async (docId: string) => {
        if (this.coveOwnedDocIds.has(docId)) return; // Cove opened this doc itself
        this.coveOwnedDocIds.add(docId);
        const meta = workspace.meta.getDocMeta(docId);
        const title = meta?.title ?? undefined;
        try {
          await this.docCreatedHandler(docId, title);
        } catch {
          // Best-effort: if DB sync fails, the doc still exists in-memory.
        }
      });
      this.workspace = workspace;
    }
    return this.workspace;
  }

  openNoteDoc(noteId: string, content: string): BlockSuiteDoc {
    const ws = this.getWorkspace();
    this.coveOwnedDocIds.add(noteId);
    const doc = ws.getDoc(noteId) ?? ws.createDoc(noteId);
    if (!this.initializedDocs.has(noteId)) {
      const snapshotB64 = unpackBlockSuiteContent(content);
      const store = doc.getStore();
      try {
        const flags = store.get(FeatureFlagService);
        // Canvas feature flags are user-configurable in Settings; read the live
        // preferences (injected provider) and apply them per-doc.
        const prefs = this.canvasPrefsProvider();
        flags.setFlag("enable_turbo_renderer", prefs.turboRenderer);
        flags.setFlag("enable_edgeless_scribbled_style", prefs.scribbledStyle);
        flags.setFlag("enable_shape_shadow_blur", prefs.shapeShadowBlur);
        flags.setFlag("enable_dom_renderer", prefs.domRenderer);
        flags.setFlag("enable_advanced_block_visibility", true);
      } catch {
        // FeatureFlagService is registered by store extensions; guard anyway.
      }
      if (snapshotB64) {
        // Yjs updates merge; they do not overwrite. Clear metadata placeholders
        // before applying the persisted state or the document gets two roots.
        doc.load();
        doc.clear();
        applySnapshot(doc.spaceDoc, snapshotB64);
      } else if (store.getAllModels().length === 0) {
        doc.load(() => seedDefaultBlocks(store));
      } else if (!doc.ready) {
        doc.load();
      }

      normalizeBlockTree(doc);
      doc.getStore().resetHistory();
      this.initializedDocs.add(noteId);
    }
    return doc;
  }

  getDocStoreForPeek(docId: string): BlockSuiteStore | null {
    const ws = this.getWorkspace();
    const doc = ws.getDoc(docId);
    if (!doc) return null;
    return doc.getStore();
  }

  registerExistingNotes(notes: Array<{ id: string; title: string }>): void {
    // Ensure workspace exists (fetchNotes may run before the editor mounts).
    const ws = this.getWorkspace();
    const newIds = new Set(notes.map((n) => n.id));

    // Remove previously registered notes that are NOT in the new set and NOT
    // currently open in the editor — keeps @-mention scoped to current workspace.
    for (const oldId of this.registeredMetaIds) {
      if (!newIds.has(oldId) && !this.initializedDocs.has(oldId)) {
        try {
          ws.removeDoc(oldId);
        } catch {
          // Doc might be in use — skip.
        }
        this.coveOwnedDocIds.delete(oldId);
      }
    }
    this.registeredMetaIds.clear();

    for (const { id, title } of notes) {
      this.registeredMetaIds.add(id);
      if (this.coveOwnedDocIds.has(id)) continue;
      if (ws.getDoc(id)) continue;
      this.coveOwnedDocIds.add(id);
      // Metadata is sufficient for linked-doc search. Do not seed block content
      // here: applying a persisted Yjs update onto those placeholder blocks merges
      // both trees and creates multiple roots.
      ws.createDoc(id);
      ws.meta.setDocMeta(id, { title });
    }
  }

  isWorkspaceAlive(): boolean {
    return this.workspace !== null;
  }

  reset(): void {
    this.workspace?.forceStop();
    this.workspace?.dispose();
    this.workspace = null;
    this.initializedDocs.clear();
    this.coveOwnedDocIds.clear();
  }

  provideCanvasPrefs(provider: () => CanvasPrefs): void {
    this.canvasPrefsProvider = provider;
  }

  provideDocCreatedHandler(handler: (docId: string, title?: string) => Promise<void>): void {
    this.docCreatedHandler = handler;
  }
}
