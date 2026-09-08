import { StoreExtensionManager, ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import { getInternalViewExtensions } from "@blocksuite/affine/extensions/view";
import { FoundationViewExtension } from "@blocksuite/affine/foundation/view";
import { BlockPlainTextAdapterExtension } from "@blocksuite/affine/shared/adapters";
import { AffineCanvasTextFonts, FeatureFlagService } from "@blocksuite/affine/shared/services";
import type { ExtensionType } from "@blocksuite/affine/store";
// The vendored store package exports Workspace only as an interface — this
// test entrypoint is its sole concrete implementation.
import { TestWorkspace } from "@blocksuite/affine/store/test";
import { effects as registerEditorContainer } from "@blocksuite/integration-test/effects";
import type { BlobSource } from "@blocksuite/sync";
import {
  type BlockSuiteDoc,
  type BlockSuiteStore,
  normalizeBlockTree,
  seedDefaultBlocks,
} from "../editor/BlockTreeNormalizer";
import { packBlockSuiteContent, unpackBlockSuiteContent } from "../editor/contentFormat";
import { applySnapshot, encodeDocSnapshot } from "../editor/yjsCodec";
import { Logger } from "../Logger";
import {
  type CanvasPrefs,
  DEFAULT_CANVAS_PREFS,
  type IBlockSuiteEditorService,
} from "./IBlockSuiteEditorService";
import { covePeekViewService, dismissAllPeeks } from "./peekViewService";

interface BlockSuiteEditorServiceDeps {
  blobSource: BlobSource;
}

// The vendored transformers finish with a browser-style blob download that
// dies silently in the Tauri webview (no download handler). We register a
// native saver on globalThis that the patched `download()` delegates to;
// its promises queue here so exportDoc can await the actual write before
// reporting success.
declare global {
  var __coveNativeSave: ((blob: Blob, fileName: string) => Promise<string | null>) | undefined;
  var __coveSaveQueue: Promise<string | null>[] | undefined;
}

/** Native save: system Save dialog → bytes → Rust write. Resolves null when
 *  the user cancels, so cancellation stays silent. */
const nativeSaveBlob = async (blob: Blob, fileName: string): Promise<string | null> => {
  const trace = (stage: string) => {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      try {
        const ring = JSON.parse(localStorage.getItem("cove-export-trace") ?? "[]") as string[];
        ring.push(`${Math.round(performance.now())}ms save(${fileName}) ${stage}`);
        localStorage.setItem("cove-export-trace", JSON.stringify(ring.slice(-40)));
      } catch {}
    }
  };
  trace("start");
  const { save } = await import("@tauri-apps/plugin-dialog");
  trace("plugin-dialog loaded");
  const ext = fileName.includes(".") ? (fileName.split(".").pop() ?? "") : "";
  const path = await save({
    defaultPath: fileName,
    filters: ext ? [{ name: ext.toUpperCase(), extensions: [ext] }] : undefined,
  });
  trace(`dialog resolved: ${JSON.stringify(path)}`);
  if (!path) return null;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("save_exported_file", { path, bytes: new Uint8Array(await blob.arrayBuffer()) });
  trace("file written");
  return path;
};

// pdfmake resolves font names through its virtual file system — a relative
// URL is treated as a vfs key, not something to fetch (the vendored adapter's
// absolute https URLs only work online). Load the bundled Liberation faces
// into the vfs as base64 once, offline-safe, mapped onto both font names the
// PDF adapter uses.
let pdfFontsReady: Promise<void> | null = null;
const PDF_FACES = [
  ["normal", "LiberationSans-Regular.ttf"],
  ["bold", "LiberationSans-Bold.ttf"],
  ["italics", "LiberationSans-Italic.ttf"],
  ["bolditalics", "LiberationSans-BoldItalic.ttf"],
] as const;
const loadPdfFonts = async (): Promise<void> => {
  const pdfMake = (await import("pdfmake/build/pdfmake")).default;
  const vfs: Record<string, string> = {};
  for (const [, file] of PDF_FACES) {
    const res = await fetch(`/fonts/${file}`);
    if (!res.ok) throw new Error(`PDF export font ${file} failed to load (${res.status})`);
    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < buf.length; i += CHUNK) {
      binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
    }
    vfs[file] = btoa(binary);
  }
  // pdfmake 0.3 dropped the `vfs` property — addVirtualFileSystem feeds the
  // module-level VirtualFileSystem singleton the adapter's fonts resolve
  // against (entries are base64 strings).
  pdfMake.addVirtualFileSystem(vfs);
  const slots = {
    normal: "LiberationSans-Regular.ttf",
    bold: "LiberationSans-Bold.ttf",
    italics: "LiberationSans-Italic.ttf",
    bolditalics: "LiberationSans-BoldItalic.ttf",
  } as const;
  pdfMake.fonts = { Inter: slots, SarasaGothicCL: slots };
};

// Image blocks carry no text, so plaintext exports of image-heavy notes
// (tweet saves) come out as nothing but the title. Emit a stand-in line so
// plaintext previews and exports keep the note's structure.
const imagePlainTextAdapter = BlockPlainTextAdapterExtension({
  flavour: "affine:image",
  toMatch: () => false,
  fromMatch: (o: { node: { flavour: string } }) => o.node.flavour === "affine:image",
  toBlockSnapshot: {},
  fromBlockSnapshot: {
    enter: (
      o: { node: { props: { caption?: unknown } } },
      context: { textBuffer: { content: string } },
    ) => {
      const caption = o.node.props.caption;
      const label =
        typeof caption === "string" && caption.trim() ? `[image: ${caption}]` : "[image]";
      context.textBuffer.content += `${label}\n`;
    },
  },
});

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
  private noteSavedHandler: (docId: string, content: string) => Promise<void> = async () =>
    undefined;

  private docTitleHandler: (docId: string, title: string) => Promise<void> = async () => undefined;

  private readonly docCreatedPromises = new Map<string, Promise<void>>();

  private readonly knownTitles = new Map<string, string>();

  constructor(private readonly deps: BlockSuiteEditorServiceDeps) {
    registerEditorContainer();
  }

  getViewManager(): ViewExtensionManager {
    if (!this.viewManager) {
      this.viewManager = new ViewExtensionManager(getInternalViewExtensions());
      this.viewManager.configure(FoundationViewExtension, {
        peekView: covePeekViewService,
        // Canvas text families (blocksuite:surface:*) only exist once the
        // FontLoaderService registers them; without a fontConfig the
        // edgeless font picker switches between families that never resolve.
        fontConfig: AffineCanvasTextFonts.map((font) => ({
          ...font,
          url: `/fonts/${font.url.split("/").pop()}`,
        })),
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
      workspace.storeExtensions = [...storeManager.get("store"), imagePlainTextAdapter];
      workspace.meta.initialize();
      workspace.start();

      workspace.meta.docMetaAdded.subscribe((docId: string) => {
        if (this.coveOwnedDocIds.has(docId)) return;
        this.coveOwnedDocIds.add(docId);
        const meta = workspace.meta.getDocMeta(docId);
        const title = meta?.title ?? undefined;
        const created = (async () => {
          try {
            await this.docCreatedHandler(docId, title);
          } catch (err) {
            // Without a notes row the in-memory doc could never save — drop
            // it, unless the user already has it open (same guard as
            // registerExistingNotes: never removeDoc a mounted doc).
            if (!this.initializedDocs.has(docId)) {
              try {
                workspace.removeDoc(docId);
              } catch {}
              this.coveOwnedDocIds.delete(docId);
              this.knownTitles.delete(docId);
            }
            throw err;
          }
        })();
        this.docCreatedPromises.set(docId, created);
        // Successful entries are dropped; failed ones stay so late awaiters
        // (markdown import) still see the rejection. The no-op rejection
        // handler marks the fire-and-forget path as handled.
        void created.then(
          () => this.docCreatedPromises.delete(docId),
          () => {},
        );
      });

      this.workspace = workspace;
    }
    return this.workspace;
  }

  private assertMetaTitle(docId: string): void {
    const ws = this.workspace;
    if (!ws) return;
    const title = this.knownTitles.get(docId);
    if (title === undefined) return;
    try {
      const meta = ws.meta.getDocMeta(docId);
      if (meta && (meta.title ?? "") !== title) {
        ws.meta.setDocMeta(docId, { title });
      }
    } catch {}
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
      try {
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
      } catch (err) {
        Logger.error("blocksuite: openNoteDoc restore failed; reseeding note", undefined, {
          noteId,
          name: err instanceof Error ? err.name : typeof err,
          message: err instanceof Error ? err.message : String(err),
        });
        try {
          doc.clear();
          seedDefaultBlocks(store);
        } catch {}
      }
      doc.getStore().resetHistory();
      this.initializedDocs.add(noteId);

      this.assertMetaTitle(noteId);
    }
    return doc;
  }

  /** Exports via the vendored transformers and saves through the native
   *  dialog. Resolves the written path, or null when the user cancelled. */
  async exportDoc(noteId: string, format: "markdown" | "html" | "pdf"): Promise<string | null> {
    const ws = this.getWorkspace();
    const doc = ws.getDoc(noteId);
    if (!doc) throw new Error("Note doc is not open; cannot export.");
    const store = doc.getStore();
    const { MarkdownTransformer, HtmlTransformer, PdfTransformer } = await import(
      "@blocksuite/affine/widgets/linked-doc"
    );
    globalThis.__coveSaveQueue = [];
    const queue = globalThis.__coveSaveQueue;
    globalThis.__coveNativeSave = nativeSaveBlob;
    const trace = (stage: string) => {
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        try {
          const ring = JSON.parse(localStorage.getItem("cove-export-trace") ?? "[]") as string[];
          ring.push(`${Math.round(performance.now())}ms [${format}] ${stage}`);
          localStorage.setItem("cove-export-trace", JSON.stringify(ring.slice(-40)));
        } catch {}
      }
    };
    trace(`transformers imported; hook=${typeof globalThis.__coveNativeSave}`);
    try {
      if (format === "markdown") await MarkdownTransformer.exportDoc(store);
      else if (format === "html") await HtmlTransformer.exportDoc(store);
      else {
        // pdfmake fonts come from the local vfs (Liberation Sans, the app
        // font) — the adapter's cdn.affine.pro assignment is replaced after
        // its module import so an offline app still renders text.
        if (!pdfFontsReady) pdfFontsReady = loadPdfFonts();
        await pdfFontsReady;
        await PdfTransformer.exportDoc(store);
      }
      trace(`transformer done; queue=${queue.length}`);
      const saved = await Promise.all(queue);
      trace(`settled: ${JSON.stringify(saved)}`);
      return saved.find((p): p is string => p !== null) ?? null;
    } catch (err) {
      trace(`THREW: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      delete globalThis.__coveNativeSave;
      queue.length = 0;
    }
  }

  async importMarkdownFile(file: File): Promise<string | undefined> {
    const ws = this.getWorkspace();
    const markdown = await file.text();
    const { MarkdownTransformer } = await import("@blocksuite/affine/widgets/linked-doc");

    const sampleDoc = ws.docs.values().next().value;
    if (!sampleDoc) throw new Error("Open a note before importing.");
    // Adapter matchers (markdown/plain-text per block) are registered ONLY
    // in the STORE scope — passing view extensions imports an empty note
    // with nothing but the title surviving.
    const docId = await MarkdownTransformer.importMarkdownToDoc({
      collection: ws,
      schema: sampleDoc.getStore().schema,
      markdown,
      fileName: file.name.replace(/\.md$/i, ""),
      extensions: ws.storeExtensions,
    });
    if (!docId) return docId;
    await this.persistImportedDoc(docId);
    return docId;
  }

  async importMarkdownBatch(files: File[]): Promise<string[]> {
    const ws = this.getWorkspace();
    const { ObsidianTransformer, commitImportBatchToWorkspace } = await import(
      "@blocksuite/affine/widgets/linked-doc"
    );

    const sampleDoc = ws.docs.values().next().value;
    if (!sampleDoc) throw new Error("Open a note before importing.");
    const schema = sampleDoc.getStore().schema;
    // The planner only recognizes .md notes; everything else stages as an
    // asset, and .markdown files would silently become stray blobs.
    const plannerFiles = files.filter(
      (f) => /\.(md)$/i.test(f.name) || !/\.markdown$/i.test(f.name),
    );
    const planned = await ObsidianTransformer.planObsidianVault({
      collection: ws,
      schema,
      importedFiles: plannerFiles,
      extensions: ws.storeExtensions,
    });
    const committed = await commitImportBatchToWorkspace(ws, schema, planned.batch);
    const persisted: string[] = [];
    for (const docId of committed.docIds) {
      try {
        await this.persistImportedDoc(docId);
        // The commit path stamps doc titles only AFTER creation, so the
        // doc-created handler persisted each row as "Untitled" — push the
        // planned title through now.
        const title = ws.meta.getDocMeta(docId)?.title;
        if (title) await this.docTitleHandler(docId, title);
        persisted.push(docId);
      } catch {
        // One unpersistable doc must not abandon the rest of the batch.
      }
    }
    return persisted;
  }

  /** Waits for the doc-created handler's notes row, then persists the
   *  imported content through the normal save path. */
  private async persistImportedDoc(docId: string): Promise<void> {
    const created = this.docCreatedPromises.get(docId);
    if (created) await created;
    const ws = this.workspace;
    const doc = ws?.getDoc(docId);
    if (doc) {
      if (!doc.ready) doc.load();
      const content = packBlockSuiteContent(encodeDocSnapshot(doc.spaceDoc));
      await this.noteSavedHandler(docId, content);
    }
  }

  getDocStoreForPeek(docId: string): BlockSuiteStore | null {
    const ws = this.getWorkspace();
    const doc = ws.getDoc(docId);
    if (!doc) return null;
    if (!doc.ready) {
      try {
        doc.load();
      } catch {
        return null;
      }
    }
    return doc.getStore();
  }

  isNoteDocLoaded(docId: string): boolean {
    return this.initializedDocs.has(docId);
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
        this.knownTitles.delete(oldId);
      }
    }
    this.registeredMetaIds.clear();

    for (const { id, title } of notes) {
      this.registeredMetaIds.add(id);

      this.knownTitles.set(id, title);
      if (this.coveOwnedDocIds.has(id)) {
        this.assertMetaTitle(id);
        continue;
      }
      if (ws.getDoc(id)) {
        this.assertMetaTitle(id);
        continue;
      }
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
    dismissAllPeeks();
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
    this.registeredMetaIds.clear();
    this.knownTitles.clear();
    this.docCreatedPromises.clear();
  }

  provideCanvasPrefs(provider: () => CanvasPrefs): void {
    this.canvasPrefsProvider = provider;
  }

  provideDocCreatedHandler(handler: (docId: string, title?: string) => Promise<void>): void {
    this.docCreatedHandler = handler;
  }

  provideNoteSavedHandler(handler: (docId: string, content: string) => Promise<void>): void {
    this.noteSavedHandler = handler;
  }

  provideDocTitleHandler(handler: (docId: string, title: string) => Promise<void>): void {
    this.docTitleHandler = handler;
  }

  setDocTitle(docId: string, title: string): void {
    this.knownTitles.set(docId, title);
    this.assertMetaTitle(docId);
  }
}
