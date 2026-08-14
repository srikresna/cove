import { type BlockModel, Text } from "@blocksuite/affine/store";
import type { TestWorkspace } from "@blocksuite/affine/store/test";
import * as Y from "yjs";

export type BlockSuiteDoc = NonNullable<ReturnType<TestWorkspace["getDoc"]>>;
export type BlockSuiteStore = ReturnType<BlockSuiteDoc["getStore"]>;

export function seedDefaultBlocks(store: BlockSuiteStore): void {
  const rootId = store.addBlock("affine:page", { title: new Text() });
  store.addBlock("affine:surface", {}, rootId);
  const noteBlockId = store.addBlock("affine:note", {}, rootId);
  store.addBlock("affine:paragraph", {}, noteBlockId);
}

function cloneYValue(value: unknown): unknown {
  if (value instanceof Y.Map) {
    const clone = new Y.Map();
    value.forEach((v, k) => {
      clone.set(k, cloneYValue(v));
    });
    return clone;
  }
  if (value instanceof Y.Array) {
    const clone = new Y.Array<unknown>();
    clone.push(value.map(cloneYValue));
    return clone;
  }
  if (value instanceof Y.Text) {
    const clone = new Y.Text();
    clone.applyDelta(value.toDelta());
    return clone;
  }
  return value;
}

type SurfaceLike = {
  elements: { getValue(): Y.Map<Y.Map<unknown>> | undefined };
};

export function normalizeBlockTree(doc: BlockSuiteDoc): void {
  const store = doc.getStore();
  const pageBlocks = store.getBlocksByFlavour("affine:page");
  if (pageBlocks.length === 0) {
    seedDefaultBlocks(store);
    return;
  }

  const surfaceBlocks = store.getBlocksByFlavour("affine:surface");
  const getElements = (model: BlockModel) => (model as unknown as SurfaceLike).elements?.getValue();

  let primary: BlockModel | undefined;
  if (surfaceBlocks.length > 0) {
    primary = surfaceBlocks.reduce((best, current) =>
      (getElements(current.model)?.size ?? 0) >= (getElements(best.model)?.size ?? 0)
        ? current
        : best,
    ).model;
  }

  let mergeCompleted = false;
  if (primary && surfaceBlocks.length > 1) {
    const primarySurface = primary;
    const primaryElements = getElements(primarySurface);
    if (primaryElements) {
      mergeCompleted = true;
      store.transact(() => {
        for (const surface of surfaceBlocks) {
          if (surface.id === primarySurface.id) continue;
          getElements(surface.model)?.forEach((elementYMap, id) => {
            if (primaryElements.has(id)) return;
            primaryElements.set(id, cloneYValue(elementYMap) as Y.Map<unknown>);
          });
        }
      });
    }
  }

  if (mergeCompleted && primary) {
    const elements = getElements(primary);
    if (elements && elements.size > 0) {
      const seen = new Set<string>();
      const dupes: string[] = [];
      elements.forEach((elYMap: Y.Map<unknown>, id: string) => {
        const sig = `${elYMap.get("type") ?? ""}:${elYMap.get("xywh") ?? ""}`;
        if (seen.has(sig)) dupes.push(id);
        else seen.add(sig);
      });
      if (dupes.length > 0) {
        store.transact(() => {
          for (const id of dupes) elements.delete(id);
        });
      }
    }
  }

  const root =
    pageBlocks.find(({ model }) =>
      primary ? model.children.some(({ id }) => id === primary.id) : false,
    )?.model ??
    (store.root?.flavour === "affine:page" ? store.root : undefined) ??
    pageBlocks[0]?.model;
  if (!root) {
    seedDefaultBlocks(store);
    return;
  }

  const children: BlockModel[] = [];
  const childIds = new Set<string>();
  const append = (model: BlockModel) => {
    if (childIds.has(model.id)) return;
    childIds.add(model.id);
    children.push(model);
  };

  if (primary) append(primary);

  for (const page of pageBlocks) {
    for (const child of page.model.children) {
      if (child.flavour !== "affine:surface") append(child);
    }
  }

  if (!children.some((child) => child.flavour === "affine:surface")) {
    const surfaceId = store.addBlock("affine:surface", {}, root);
    const surface = store.getModelById(surfaceId);
    if (surface) append(surface);
  }
  if (!children.some((child) => child.flavour === "affine:note")) {
    const noteId = store.addBlock("affine:note", {}, root);
    const note = store.getModelById(noteId);
    if (note) {
      store.addBlock("affine:paragraph", {}, note);
      append(note);
    }
  }

  store.updateBlock(root, { children });

  store.transact(() => {
    for (const page of pageBlocks) {
      if (page.id !== root.id) doc.yBlocks.delete(page.id);
    }
    if (mergeCompleted) {
      for (const surface of surfaceBlocks) {
        if (primary && surface.id !== primary.id) doc.yBlocks.delete(surface.id);
      }
    }
  });
}
