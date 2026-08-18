import type { TestAffineEditorContainer as _TEC } from "@blocksuite/integration-test";

export type TestAffineEditorContainer = _TEC & HTMLElement & { updateComplete: Promise<boolean> };

export function createEditorContainer(): TestAffineEditorContainer {
  return document.createElement("affine-editor-container") as TestAffineEditorContainer;
}
