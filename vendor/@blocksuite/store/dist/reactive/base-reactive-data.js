import * as Y from 'yjs';
export class BaseReactiveYData {
    constructor() {
        this._getOrigin = (doc) => {
            return {
                doc,
                proxy: true,
                target: this,
            };
        };
        this._onObserve = (event, handler) => {
            if (event.transaction.origin?.force === true ||
                (event.transaction.origin?.proxy !== true &&
                    (!event.transaction.local ||
                        event.transaction.origin instanceof Y.UndoManager))) {
                handler();
            }
            const isLocal = !event.transaction.origin ||
                !this._ySource.doc ||
                event.transaction.origin instanceof Y.UndoManager ||
                event.transaction.origin.proxy
                ? true
                : event.transaction.origin === this._ySource.doc.clientID;
            this._options?.onChange?.(this._proxy, isLocal);
        };
        this._skipNext = false;
        this._stashed = new Set();
        this._transact = (doc, fn) => {
            doc.transact(fn, this._getOrigin(doc));
        };
        this._updateWithSkip = (fn) => {
            if (this._skipNext) {
                return;
            }
            this._skipNext = true;
            fn();
            this._skipNext = false;
        };
    }
    get proxy() {
        return this._proxy;
    }
}
