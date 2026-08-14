import { StoreExtensionManager } from "@blocksuite/affine/ext-loader";
import { getInternalStoreExtensions } from "@blocksuite/affine/extensions/store";
import type { BlockModel } from "@blocksuite/affine/store";
import { Text } from "@blocksuite/affine/store";
import { TestWorkspace } from "@blocksuite/affine/store/test";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  type BlockSuiteDoc,
  type BlockSuiteStore,
  normalizeBlockTree,
  seedDefaultBlocks,
} from "@/services/editor/BlockTreeNormalizer";

type SurfaceLike = {
  elements: { getValue(): Y.Map<Y.Map<unknown>> | undefined };
};

let counter = 0;

function createDoc(): BlockSuiteDoc {
  const ws = new TestWorkspace({ id: `ws-${counter++}` });
  const storeExt = new StoreExtensionManager(getInternalStoreExtensions());
  ws.storeExtensions = storeExt.get("store");
  ws.meta.initialize();
  ws.start();
  const doc = ws.createDoc(`d-${counter}`);
  doc.load();
  return doc;
}

function surfaceElements(model: BlockModel): Y.Map<Y.Map<unknown>> {
  const els = (model as unknown as SurfaceLike).elements?.getValue();
  if (!els) throw new Error("surface model has no elements map");
  return els;
}

function getModel(store: BlockSuiteStore, id: string): BlockModel {
  const model = store.getModelById(id);
  if (!model) throw new Error(`block ${id} not found`);
  return model;
}

function addElement(els: Y.Map<Y.Map<unknown>>, id: string, type: string, xywh: string): void {
  const el = new Y.Map();
  el.set("type", type);
  el.set("xywh", xywh);
  els.set(id, el);
}

function buildStandardDoc(doc: BlockSuiteDoc) {
  const store = doc.getStore();
  const rootId = store.addBlock("affine:page", { title: new Text() });
  const surfaceId = store.addBlock("affine:surface", {}, rootId);
  const noteId = store.addBlock("affine:note", {}, rootId);
  store.addBlock("affine:paragraph", {}, noteId);
  return { store, rootId, surfaceId, noteId };
}

function firstBlockModel(store: BlockSuiteStore, flavour: string): BlockModel {
  const block = store.getBlocksByFlavour(flavour)[0];
  if (!block) throw new Error(`no ${flavour} block found`);
  return block.model;
}

describe("BlockTreeNormalizer", () => {
  describe("seedDefaultBlocks", () => {
    it("seeds page + surface + note + paragraph into an empty doc", () => {
      const doc = createDoc();
      const store = doc.getStore();
      seedDefaultBlocks(store);
      expect(store.getBlocksByFlavour("affine:page")).toHaveLength(1);
      expect(store.getBlocksByFlavour("affine:surface")).toHaveLength(1);
      expect(store.getBlocksByFlavour("affine:note")).toHaveLength(1);
      expect(store.getBlocksByFlavour("affine:paragraph")).toHaveLength(1);
    });
  });

  describe("normalizeBlockTree", () => {
    it("seeds defaults when the doc has no page root", () => {
      const doc = createDoc();
      normalizeBlockTree(doc);
      const store = doc.getStore();
      expect(store.getBlocksByFlavour("affine:page")).toHaveLength(1);
      expect(store.getBlocksByFlavour("affine:surface")).toHaveLength(1);
    });

    it("is a no-op for a clean single-surface doc (no duplicates)", () => {
      const doc = createDoc();
      const { store, surfaceId } = buildStandardDoc(doc);
      const els = surfaceElements(getModel(store, surfaceId));
      addElement(els, "a", "shape", "[0,0,100,100]");

      normalizeBlockTree(doc);

      expect(store.getBlocksByFlavour("affine:page")).toHaveLength(1);
      expect(store.getBlocksByFlavour("affine:surface")).toHaveLength(1);
      expect(surfaceElements(firstBlockModel(store, "affine:surface")).size).toBe(1);
    });

    it("re-injects a missing surface block", () => {
      const doc = createDoc();
      const store = doc.getStore();
      const rootId = store.addBlock("affine:page", { title: new Text() });
      store.addBlock("affine:note", {}, rootId);

      normalizeBlockTree(doc);

      expect(store.getBlocksByFlavour("affine:surface")).toHaveLength(1);
    });

    it("re-injects a missing note block", () => {
      const doc = createDoc();
      const store = doc.getStore();
      const rootId = store.addBlock("affine:page", { title: new Text() });
      store.addBlock("affine:surface", {}, rootId);

      normalizeBlockTree(doc);

      expect(store.getBlocksByFlavour("affine:note")).toHaveLength(1);
      expect(
        firstBlockModel(store, "affine:note").children.some(
          (c) => c.flavour === "affine:paragraph",
        ),
      ).toBe(true);
    });

    it("merges multiple surfaces into one and deletes the duplicates", () => {
      const doc = createDoc();
      const store = doc.getStore();
      const rootId = store.addBlock("affine:page", { title: new Text() });
      const s1 = store.addBlock("affine:surface", {}, rootId);
      const s2 = store.addBlock("affine:surface", {}, rootId);
      addElement(surfaceElements(getModel(store, s1)), "el1", "shape", "[0,0,100,100]");
      addElement(surfaceElements(getModel(store, s2)), "el2", "shape", "[200,200,100,100]");

      normalizeBlockTree(doc);

      const surfaces = store.getBlocksByFlavour("affine:surface");
      expect(surfaces).toHaveLength(1);
      expect(surfaceElements(firstBlockModel(store, "affine:surface")).size).toBe(2);
    });

    it("deduplicates canvas elements copied across corrupted surfaces (same type + bound)", () => {
      const doc = createDoc();
      const store = doc.getStore();
      const rootId = store.addBlock("affine:page", { title: new Text() });
      const s1 = store.addBlock("affine:surface", {}, rootId);
      const s2 = store.addBlock("affine:surface", {}, rootId);

      addElement(surfaceElements(getModel(store, s1)), "el-a", "shape", "[0,0,100,100]");
      addElement(surfaceElements(getModel(store, s2)), "el-b", "shape", "[0,0,100,100]");

      normalizeBlockTree(doc);

      expect(surfaceElements(firstBlockModel(store, "affine:surface")).size).toBe(1);
    });

    it("does NOT dedup on a clean single-surface doc (preserves legitimate stacks)", () => {
      const doc = createDoc();
      const { store, surfaceId } = buildStandardDoc(doc);
      const els = surfaceElements(getModel(store, surfaceId));
      addElement(els, "a", "shape", "[0,0,100,100]");
      addElement(els, "b", "shape", "[0,0,100,100]");

      normalizeBlockTree(doc);

      expect(surfaceElements(firstBlockModel(store, "affine:surface")).size).toBe(2);
    });

    it("is idempotent — running twice produces the same structure", () => {
      const doc = createDoc();
      const store = doc.getStore();
      const rootId = store.addBlock("affine:page", { title: new Text() });
      const s1 = store.addBlock("affine:surface", {}, rootId);
      const s2 = store.addBlock("affine:surface", {}, rootId);
      addElement(surfaceElements(getModel(store, s1)), "a", "shape", "[0,0,100,100]");
      addElement(surfaceElements(getModel(store, s2)), "b", "shape", "[0,0,100,100]");

      normalizeBlockTree(doc);
      const surfacesAfter1 = store.getBlocksByFlavour("affine:surface").length;
      const elementsAfter1 = surfaceElements(firstBlockModel(store, "affine:surface")).size;

      normalizeBlockTree(doc);
      const surfacesAfter2 = store.getBlocksByFlavour("affine:surface").length;
      const elementsAfter2 = surfaceElements(firstBlockModel(store, "affine:surface")).size;

      expect(surfacesAfter2).toBe(surfacesAfter1);
      expect(elementsAfter2).toBe(elementsAfter1);
    });
  });
});
