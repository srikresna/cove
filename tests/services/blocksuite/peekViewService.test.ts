import { beforeEach, describe, expect, it } from "vitest";
import { covePeekViewService, usePeekViewStore } from "@/services/blocksuite/peekViewService";

function makeSurfaceRefTarget(docId: string, xywh: string): HTMLElement {
  // Mimic a BlockSuite surface-ref block component: has .model.flavour and
  // .referenceModel pointing at the mirrored edgeless element.
  const el = document.createElement("div");
  Object.defineProperty(el, "model", {
    value: { flavour: "affine:surface-ref" },
    configurable: true,
  });
  Object.defineProperty(el, "referenceModel", {
    value: { xywh, store: { id: docId } },
    configurable: true,
  });
  return el;
}

describe("peekViewService", () => {
  beforeEach(() => {
    usePeekViewStore.getState().close();
  });

  describe("usePeekViewStore", () => {
    it("open sets the request and stashes the resolve callback", () => {
      let resolved = false;
      usePeekViewStore
        .getState()
        .open({ docId: "n1", mode: "edgeless", xywh: "[0,0,100,100]" }, () => {
          resolved = true;
        });
      const { request } = usePeekViewStore.getState();
      expect(request).not.toBeNull();
      expect(request?.docId).toBe("n1");
      expect(resolved).toBe(false);
    });

    it("close invokes the resolve callback and clears the request", () => {
      let resolved = false;
      usePeekViewStore.getState().open({ docId: "n2", mode: "edgeless" }, () => {
        resolved = true;
      });
      usePeekViewStore.getState().close();
      expect(resolved).toBe(true);
      expect(usePeekViewStore.getState().request).toBeNull();
    });
  });

  describe("covePeekViewService.peek", () => {
    it("resolves a surface-ref target to an edgeless peek with xywh", async () => {
      const target = makeSurfaceRefTarget("doc-1", "[10,20,300,200]");
      const promise = covePeekViewService.peek({ target });

      const { request } = usePeekViewStore.getState();
      expect(request).not.toBeNull();
      expect(request?.docId).toBe("doc-1");
      expect(request?.mode).toBe("edgeless");
      expect(request?.xywh).toBe("[10,20,300,200]");

      usePeekViewStore.getState().close();
      await expect(promise).resolves.toBeUndefined();
    });

    it("deduplicates concurrent peek() for the same target (returns same promise)", () => {
      const target = makeSurfaceRefTarget("doc-2", "[0,0,100,100]");
      const p1 = covePeekViewService.peek({ target });
      const p2 = covePeekViewService.peek({ target });
      expect(p2).toBe(p1);
    });

    it("resolves immediately (no-op) for an unrecognized target", async () => {
      const el = document.createElement("div"); // no model, no docId
      await expect(covePeekViewService.peek({ target: el })).resolves.toBeUndefined();
      expect(usePeekViewStore.getState().request).toBeNull();
    });

    it("opens a page-ref peek from { docId } args", async () => {
      const promise = covePeekViewService.peek({ docId: "ref-doc", blockIds: ["b1"] });
      const { request } = usePeekViewStore.getState();
      expect(request?.docId).toBe("ref-doc");
      expect(request?.blockIds).toEqual(["b1"]);
      usePeekViewStore.getState().close();
      await promise;
    });
  });
});
