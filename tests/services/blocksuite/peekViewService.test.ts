import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { covePeekViewService } from "@/services/blocksuite/peekViewService";
import { usePeekViewStore } from "@/store/usePeekViewStore";

function makeSurfaceRefTarget(docId: string, xywh: string): HTMLElement {
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
        .open({ type: "doc", docId: "n1", mode: "edgeless", xywh: "[0,0,100,100]" }, () => {
          resolved = true;
        });
      const { request } = usePeekViewStore.getState();
      expect(request).not.toBeNull();
      expect(request?.type === "doc" && request.docId).toBe("n1");
      expect(resolved).toBe(false);
    });

    it("close invokes the resolve callback and clears the request", () => {
      let resolved = false;
      usePeekViewStore.getState().open({ type: "doc", docId: "n2", mode: "edgeless" }, () => {
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
      expect(request?.type).toBe("doc");
      expect(request?.type === "doc" && request.docId).toBe("doc-1");
      expect(request?.type === "doc" && request.mode).toBe("edgeless");
      expect(request?.type === "doc" && request.xywh).toBe("[10,20,300,200]");

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
      const el = document.createElement("div");
      await expect(covePeekViewService.peek({ target: el })).resolves.toBeUndefined();
      expect(usePeekViewStore.getState().request).toBeNull();
    });

    it("opens a page-ref peek from { docId } args", async () => {
      const promise = covePeekViewService.peek({ docId: "ref-doc", blockIds: ["b1"] });
      const { request } = usePeekViewStore.getState();
      expect(request?.type).toBe("doc");
      expect(request?.type === "doc" && request.docId).toBe("ref-doc");
      expect(request?.type === "doc" && request.blockIds).toEqual(["b1"]);
      usePeekViewStore.getState().close();
      await promise;
    });

    it("carries database context (backlink) from the vendored openDoc args", async () => {
      const promise = covePeekViewService.peek({
        docId: "linked-doc",
        databaseId: "db-block-1",
        databaseDocId: "cal-note",
        databaseRowId: "row-9",
      });
      const { request } = usePeekViewStore.getState();
      expect(request?.type).toBe("doc");
      if (request?.type !== "doc") return;
      expect(request.databaseId).toBe("db-block-1");
      expect(request.databaseDocId).toBe("cal-note");
      expect(request.databaseRowId).toBe("row-9");
      usePeekViewStore.getState().close();
      await promise;
    });

    it("does not dedupe peeks of the same doc from different rows", async () => {
      const p1 = covePeekViewService.peek({
        docId: "d",
        databaseId: "db",
        databaseDocId: "cal",
        databaseRowId: "row-1",
      });
      const p2 = covePeekViewService.peek({
        docId: "d",
        databaseId: "db",
        databaseDocId: "cal",
        databaseRowId: "row-2",
      });
      expect(p2).not.toBe(p1);
      usePeekViewStore.getState().close();
      await Promise.all([p1, p2]);
    });

    it("does not dedupe doc peeks whose blockIds differ", async () => {
      const p1 = covePeekViewService.peek({ docId: "d", blockIds: ["b1"] });
      const p2 = covePeekViewService.peek({ docId: "d", blockIds: ["b2"] });
      expect(p2).not.toBe(p1);

      const { request } = usePeekViewStore.getState();
      expect(request?.type === "doc" && request.blockIds).toEqual(["b2"]);

      usePeekViewStore.getState().close();
      await Promise.all([p1, p2]);
    });

    it("does not dedupe a doc peek when blockIds are omitted vs present", async () => {
      const p1 = covePeekViewService.peek({ docId: "d" });
      const p2 = covePeekViewService.peek({ docId: "d", blockIds: ["b1"] });
      expect(p2).not.toBe(p1);

      const { request } = usePeekViewStore.getState();
      expect(request?.type === "doc" && request.blockIds).toEqual(["b1"]);

      usePeekViewStore.getState().close();
      await Promise.all([p1, p2]);
    });

    it("does not dedupe distinct (or identical) template peeks; second resolves the first", async () => {
      const host = document.createElement("div");
      const t1 = html`<affine-data-view-record-detail id="one"></affine-data-view-record-detail>`;
      const t2 = html`<affine-data-view-record-detail id="two"></affine-data-view-record-detail>`;
      const p1 = covePeekViewService.peek({ target: host, template: t1 });
      const p2 = covePeekViewService.peek({ target: host, template: t2 });
      expect(p2).not.toBe(p1);

      const { request } = usePeekViewStore.getState();
      expect(request?.type).toBe("template");
      expect(request?.type === "template" && request.template).toBe(t2);

      await p1;
      usePeekViewStore.getState().close();
      await p2;

      const p3 = covePeekViewService.peek({ target: host, template: t1 });
      const p4 = covePeekViewService.peek({ target: host, template: t1 });
      expect(p4).not.toBe(p3);
      usePeekViewStore.getState().close();
      await Promise.all([p3, p4]);
    });

    it("opens a template peek from { target, template } args (data-view row detail)", async () => {
      const target = document.createElement("div");
      const template = html`<affine-data-view-record-detail></affine-data-view-record-detail>`;
      const promise = covePeekViewService.peek({ target, template });

      const { request } = usePeekViewStore.getState();
      expect(request?.type).toBe("template");
      expect(request?.type === "template" && request.template).toBe(template);

      usePeekViewStore.getState().close();
      await expect(promise).resolves.toBeUndefined();
    });

    it("prioritizes template over target/docId resolution", async () => {
      const target = makeSurfaceRefTarget("doc-3", "[0,0,10,10]");
      const template = html`<div>detail</div>`;
      const promise = covePeekViewService.peek({ target, template });

      const { request } = usePeekViewStore.getState();
      expect(request?.type).toBe("template");

      usePeekViewStore.getState().close();
      await promise;
    });

    it("opening a new peek resolves the previous request (single modal)", async () => {
      let firstResolved = false;
      usePeekViewStore.getState().open({ type: "doc", docId: "a", mode: "edgeless" }, () => {
        firstResolved = true;
      });
      usePeekViewStore.getState().open({ type: "doc", docId: "b", mode: "edgeless" }, () => {});

      expect(firstResolved).toBe(true);
      const { request } = usePeekViewStore.getState();
      expect(request?.type === "doc" && request.docId).toBe("b");

      usePeekViewStore.getState().close();
    });
  });
});
