import { DisposableGroup } from "@blocksuite/global/disposable";

/**
 * Suppresses a noisy, non-fatal BlockSuite teardown error.
 *
 * BlockSuite's `DisposableGroup.dispose()` calls `disposeMember()` (in
 * @blocksuite/global/disposable) which runs `member.dispose()` in its final
 * branch. Some embed-block members are plain objects without a `.dispose()`
 * method — disposing them throws `disposable.dispose is not a function`. The
 * error is caught and only `console.error`'d, so it never breaks anything, but
 * it spams the console on every embed-block teardown (note switch, peek close).
 *
 * This overrides `dispose()` with a guarded version that skips genuinely
 * non-disposable members instead of throwing. It still correctly disposes real
 * disposables / functions / subscriptions, so behavior is preserved. Cove-side
 * (no vendored BlockSuite patch), so it survives git and BlockSuite updates.
 */
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
        // RxJS Subscription / Subject — unsubscribe closes them.
        m.unsubscribe();
      }
      // else: a plain object with no dispose/unsubscribe — skip silently
      // (this is the case that previously threw).
    } catch (e) {
      console.error(e);
    }
  }
  this._disposables = [];
  this._disposed = true;
};
