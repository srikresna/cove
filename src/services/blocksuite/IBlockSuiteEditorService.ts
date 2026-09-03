import type { ViewExtensionManager } from "@blocksuite/affine/ext-loader";
import type { ExtensionType } from "@blocksuite/affine/store";
import type { BlockSuiteDoc, BlockSuiteStore } from "../editor/BlockTreeNormalizer";

export interface CanvasPrefs {
  turboRenderer: boolean;

  scribbledStyle: boolean;

  shapeShadowBlur: boolean;

  domRenderer: boolean;
}

export const DEFAULT_CANVAS_PREFS: CanvasPrefs = {
  turboRenderer: false,
  scribbledStyle: true,
  shapeShadowBlur: false,
  domRenderer: false,
};

export interface DatabaseBacklinkRef {
  databaseDocId: string;
  databaseId: string;
  databaseRowId: string;
}

export interface IBlockSuiteEditorService {
  getViewManager(): ViewExtensionManager;

  getViewSpecs(scope: "page" | "edgeless"): ExtensionType[];

  openNoteDoc(noteId: string, content: string): BlockSuiteDoc;

  getDocStoreForPeek(docId: string): BlockSuiteStore | null;

  isNoteDocLoaded(docId: string): boolean;

  registerExistingNotes(notes: Array<{ id: string; title: string }>): void;

  isWorkspaceAlive(): boolean;

  registerPendingFlusher(fn: () => void): () => void;

  reset(): void;

  /** Exports and saves through the native Save dialog; resolves the written
   *  path, or null when the user cancelled the dialog. */
  exportDoc(noteId: string, format: "markdown" | "html" | "pdf"): Promise<string | null>;

  importMarkdownFile(file: File): Promise<string | undefined>;

  /** Imports a batch of markdown files plus their sibling assets (e.g. a
   *  tweet-save folder's .md + assets/*.png). Relative image references are
   *  resolved against the staged asset blobs, so the images land as real
   *  image blocks instead of empty sources. Returns the created doc ids. */
  importMarkdownBatch(files: File[]): Promise<string[]>;

  provideCanvasPrefs(provider: () => CanvasPrefs): void;

  provideDocCreatedHandler(handler: (docId: string, title?: string) => Promise<void>): void;

  provideNoteSavedHandler(handler: (docId: string, content: string) => Promise<void>): void;

  /** Lets the store apply a late-arriving doc title (folder imports stamp
   *  titles only after the notes row already exists). */
  provideDocTitleHandler(handler: (docId: string, title: string) => Promise<void>): void;

  setDocTitle(docId: string, title: string): void;
}
