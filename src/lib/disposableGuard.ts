import { DisposableGroup } from "@blocksuite/global/disposable";

type DisposableGroupInternals = {
  _disposables: unknown[];
  _disposed: boolean;
};

// biome-ignore lint/suspicious/noExplicitAny: prototype patching
const proto = DisposableGroup.prototype as any;

proto.dispose = function dispose(this: DisposableGroupInternals) {
  const list = this._disposables ?? [];
  for (const member of list) {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: prototype patching
      const m = member as any;
      if (m && typeof m.dispose === "function") {
        m.dispose();
      } else if (typeof m === "function") {
        m();
      } else if (m && typeof m.unsubscribe === "function") {
        m.unsubscribe();
      }
    } catch (e) {
      console.error(e);
    }
  }
  this._disposables = [];
  this._disposed = true;
};
