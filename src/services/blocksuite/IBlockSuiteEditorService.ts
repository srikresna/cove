import type { ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import type { ExtensionType } from "@blocksuite/affine/store";
import type { BlockSuiteDoc, BlockSuiteStore } from "../editor/BlockTreeNormalizer";

/**
 * User-tunable BlockSuite canvas feature flags. These map 1:1 to BlockSuite
 * `FeatureFlag` keys and are applied per-doc on open (see {@link IBlockSuiteEditorService.openNoteDoc}).
 */
export interface CanvasPrefs {
  /** Turbo renderer: idles off-screen blocks + serves cached bitmaps during
   *  zoom via a painter worker. Speeds up very dense canvases but causes
   *  element placeholder rendering during zoom on normal docs. Default off. */
  turboRenderer: boolean;
  /** Unlocks the General/Scribbled style toggle in the shape toolbar. Default on. */
  scribbledStyle: boolean;
  /** Adds a soft shadow-blur to shapes (decorative). Default off. */
  shapeShadowBlur: boolean;
  /** Use the DOM renderer instead of the default Canvas renderer. Different
   *  performance profile; mainly a fallback. Default off. */
  domRenderer: boolean;
}

export const DEFAULT_CANVAS_PREFS: CanvasPrefs = {
  turboRenderer: false,
  scribbledStyle: true,
  shapeShadowBlur: false,
  domRenderer: false,
};

/**
 * Owns the BlockSuite workspace + view-manager lifecycle and the mapping
 * between Cove notes and BlockSuite docs. Implemented as a service so it is
 * DI-managed and free of direct zustand imports — the store layer injects the
 * two pieces of UI state it needs (canvas prefs + new-doc sync) via the
 * `provide*` methods.
 */
export interface IBlockSuiteEditorService {
  /** The shared view extension manager (peek-view service wired in). */
  getViewManager(): ViewExtensionManager;
  /** Cached view extension specs for a scope (avoids rebuilding on every mount). */
  getViewSpecs(scope: "page" | "edgeless"): ExtensionType[];
  /** One BlockSuite doc per Cove note. The in-memory doc is the source of
   *  truth once opened; a persisted snapshot only seeds the first load. */
  openNoteDoc(noteId: string, content: string): BlockSuiteDoc;
  /** Doc store for a doc id, for mounting a read-only edgeless peek view. Null
   *  when the note hasn't been opened this session. */
  getDocStoreForPeek(docId: string): BlockSuiteStore | null;
  /** Registers existing Cove notes as metadata so @-mention / linked-doc search
   *  can find them; prunes notes no longer in the current workspace. */
  registerExistingNotes(notes: Array<{ id: string; title: string }>): void;
  /** Whether the workspace is still mounted (false after a vault lock). */
  isWorkspaceAlive(): boolean;
  /** Register a synchronous flush callback (encode + trigger DB write) for an
   *  open editor. Called by {@link reset} before tearing down the workspace so
   *  debounced edits are not lost on lock / window close. Returns an unregister. */
  registerPendingFlusher(fn: () => void): () => void;
  /** Disposes the workspace + every doc. Called on vault lock. */
  reset(): void;

  /** Export an open note as Markdown/HTML/PDF (triggers a browser download). */
  exportDoc(noteId: string, format: "markdown" | "html" | "pdf"): Promise<void>;
  /** Import a Markdown file as a new note doc; returns the new doc id. */
  importMarkdownFile(file: File): Promise<string | undefined>;

  /** Inject the live canvas-feature-flag provider (called by the settings store). */
  provideCanvasPrefs(provider: () => CanvasPrefs): void;
  /** Inject the handler that syncs a BlockSuite-created doc into Cove's DB
   *  (called by the note store). */
  provideDocCreatedHandler(handler: (docId: string, title?: string) => Promise<void>): void;
}
