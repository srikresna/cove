import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { FoundationViewExtension } from "@blocksuite/affine/foundation/view";
import { FeatureFlagService } from "@blocksuite/affine/shared/services";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import type { BlobSource } from "@blocksuite/sync";
import { effects as registerEditorContainer } from "@blocksuite/integration-test/effects";
import type { ExtensionType } from "@blocksuite/affine/store";
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
  // Cached view extension specs — ExtensionManager.get(scope) rebuilds on every
  // call; caching avoids that cost across editor mounts (main surface + peek).
  private cachedPageSpecs: ExtensionType[] | null = null;
  private cachedEdgelessSpecs: ExtensionType[] | null = null;
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
      this.viewManager.configure(FoundationViewExtension, {
        peekView: covePeekViewService,
      });
    }
    return this.viewManager;
  }

  getViewSpecs(scope: "page" | "edgeless"): ExtensionType[] {
    if (scope === "page" && this.cachedPageSpecs) return this.cachedPageSpecs;
    if (scope === "edgeless" && this.cachedEdgelessSpecs) return this.cachedEdgelessSpecs;
    const specs = this.getViewManager().get(scope);
    if (scope === "page") this.cachedPageSpecs = specs;
    else this.cachedEdgelessSpecs = specs;
    return specs;
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

  /**
   * Export an open note doc as Markdown / HTML / PDF. The transformer triggers
   * a browser download as a side effect. Dynamically imported so the (heavy)
   * transformer code stays out of the main bundle.
   */
  async exportDoc(noteId: string, format: "markdown" | "html" | "pdf"): Promise<void> {
    const ws = this.getWorkspace();
    const doc = ws.getDoc(noteId);
    if (!doc) throw new Error("Note doc is not open; cannot export.");
    const store = doc.getStore();
    const { MarkdownTransformer, HtmlTransformer, PdfTransformer } = await import(
      "@blocksuite/affine/widgets/linked-doc"
    );
    if (format === "markdown") await MarkdownTransformer.exportDoc(store);
    else if (format === "html") await HtmlTransformer.exportDoc(store);
    else {
      // The PdfAdapter hard-codes remote font URLs (cdn.affine.pro) which are
      // CORS-blocked off affine.pro. pdfMake is a singleton: re-point its font
      // table at the locally-served Inter TTF BEFORE exporting. The adapter's
      // default body font is "SarasaGothicCL" (CJK) and code font "Inter"; map
      // both to Inter so pdfmake resolves them (Latin-only — CJK falls back).
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const inter = "/fonts/Inter.ttf";
      const slots = { normal: inter, bold: inter, italics: inter, bolditalics: inter };
      pdfMake.fonts = { Inter: { ...slots }, SarasaGothicCL: { ...slots } };
      await PdfTransformer.exportDoc(store);
    }
  }

  /**
   * Import a Markdown file as a new note doc. Returns the new doc id; the doc
   * is created inside the workspace so the docMetaAdded subscriber syncs it to
   * Cove's DB automatically.
   */
  async importMarkdownFile(file: File): Promise<string | undefined> {
    const ws = this.getWorkspace();
    const markdown = await file.text();
    const { MarkdownTransformer } = await import("@blocksuite/affine/widgets/linked-doc");
    const extensions = this.getViewManager().get("page");
    // The schema is workspace-wide; derive it from any already-open doc.
    const sampleDoc = ws.docs.values().next().value;
    if (!sampleDoc) throw new Error("Open a note before importing.");
    return MarkdownTransformer.importMarkdownToDoc({
      collection: ws,
      schema: sampleDoc.getStore().schema,
      markdown,
      fileName: file.name.replace(/\.md$/i, ""),
      extensions,
    });
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
    this.cachedPageSpecs = null;
    this.cachedEdgelessSpecs = null;
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
