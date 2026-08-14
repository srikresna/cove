import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { FoundationViewExtension } from "@blocksuite/affine/foundation/view";
import { FeatureFlagService } from "@blocksuite/affine/shared/services";
import type { ExtensionType } from "@blocksuite/affine/store";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import { effects as registerEditorContainer } from "@blocksuite/integration-test/effects";
import type { BlobSource } from "@blocksuite/sync";
import {
  type BlockSuiteDoc,
  type BlockSuiteStore,
  normalizeBlockTree,
  seedDefaultBlocks,
} from "../editor/BlockTreeNormalizer";
import { unpackBlockSuiteContent } from "../editor/contentFormat";
import { applySnapshot } from "../editor/yjsCodec";
import {
  type CanvasPrefs,
  DEFAULT_CANVAS_PREFS,
  type IBlockSuiteEditorService,
} from "./IBlockSuiteEditorService";
import { covePeekViewService } from "./peekViewService";

interface BlockSuiteEditorServiceDeps {
  blobSource: BlobSource;
}

export class BlockSuiteEditorService implements IBlockSuiteEditorService {
  private workspace: TestWorkspace | null = null;
  private viewManager: ViewExtensionManager | null = null;

  private cachedPageSpecs: ExtensionType[] | null = null;
  private cachedEdgelessSpecs: ExtensionType[] | null = null;

  private readonly initializedDocs = new Set<string>();

  private readonly coveOwnedDocIds = new Set<string>();

  private readonly registeredMetaIds = new Set<string>();

  private canvasPrefsProvider: () => CanvasPrefs = () => DEFAULT_CANVAS_PREFS;
  private docCreatedHandler: (docId: string, title?: string) => Promise<void> = async () =>
    undefined;

  constructor(private readonly deps: BlockSuiteEditorServiceDeps) {
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
      const workspace = new TestWorkspace({
        id: "cove",
        blobSources: { main: this.deps.blobSource },
      });
      workspace.storeExtensions = storeManager.get("store");
      workspace.meta.initialize();
      workspace.start();

      workspace.meta.docMetaAdded.subscribe(async (docId: string) => {
        if (this.coveOwnedDocIds.has(docId)) return;
        this.coveOwnedDocIds.add(docId);
        const meta = workspace.meta.getDocMeta(docId);
        const title = meta?.title ?? undefined;
        try {
          await this.docCreatedHandler(docId, title);
        } catch {}
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

        const prefs = this.canvasPrefsProvider();
        flags.setFlag("enable_turbo_renderer", prefs.turboRenderer);
        flags.setFlag("enable_edgeless_scribbled_style", prefs.scribbledStyle);
        flags.setFlag("enable_shape_shadow_blur", prefs.shapeShadowBlur);
        flags.setFlag("enable_dom_renderer", prefs.domRenderer);
        flags.setFlag("enable_advanced_block_visibility", true);
      } catch {}
      if (snapshotB64) {
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
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const inter = "/fonts/Inter.ttf";
      const slots = { normal: inter, bold: inter, italics: inter, bolditalics: inter };
      pdfMake.fonts = { Inter: { ...slots }, SarasaGothicCL: { ...slots } };
      await PdfTransformer.exportDoc(store);
    }
  }

  async importMarkdownFile(file: File): Promise<string | undefined> {
    const ws = this.getWorkspace();
    const markdown = await file.text();
    const { MarkdownTransformer } = await import("@blocksuite/affine/widgets/linked-doc");
    const extensions = this.getViewManager().get("page");

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
    const ws = this.getWorkspace();
    const newIds = new Set(notes.map((n) => n.id));

    for (const oldId of this.registeredMetaIds) {
      if (!newIds.has(oldId) && !this.initializedDocs.has(oldId)) {
        try {
          ws.removeDoc(oldId);
        } catch {}
        this.coveOwnedDocIds.delete(oldId);
      }
    }
    this.registeredMetaIds.clear();

    for (const { id, title } of notes) {
      this.registeredMetaIds.add(id);
      if (this.coveOwnedDocIds.has(id)) continue;
      if (ws.getDoc(id)) continue;
      this.coveOwnedDocIds.add(id);

      ws.createDoc(id);
      ws.meta.setDocMeta(id, { title });
    }
  }

  isWorkspaceAlive(): boolean {
    return this.workspace !== null;
  }

  private readonly pendingFlushers = new Set<() => void>();

  registerPendingFlusher(fn: () => void): () => void {
    this.pendingFlushers.add(fn);
    return () => {
      this.pendingFlushers.delete(fn);
    };
  }

  reset(): void {
    for (const fn of [...this.pendingFlushers]) {
      try {
        fn();
      } catch {}
    }
    this.pendingFlushers.clear();

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
