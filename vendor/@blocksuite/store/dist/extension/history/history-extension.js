import { signal } from '@preact/signals-core';
import { Subject } from 'rxjs';
import * as Y from 'yjs';
import { StoreExtension } from '../store-extension';
export class HistoryExtension extends StoreExtension {
    static { this.key = 'history'; }
    constructor(store) {
        super(store);
        this._canRedo = signal(false);
        this._canUndo = signal(false);
        this.onUpdated = new Subject();
        this._updateCanUndoRedoSignals = () => {
            const canRedo = this._history.canRedo();
            const canUndo = this._history.canUndo();
            if (this._canRedo.peek() !== canRedo) {
                this._canRedo.value = canRedo;
            }
            if (this._canUndo.peek() !== canUndo) {
                this._canUndo.value = canUndo;
            }
        };
        this._historyObserver = () => {
            this._updateCanUndoRedoSignals();
            this.onUpdated.next();
        };
        this._history = new Y.UndoManager([this.store.doc.yBlocks], {
            trackedOrigins: new Set([this.store.doc.spaceDoc.clientID]),
        });
    }
    get canRedo() {
        return this._canRedo.peek();
    }
    get canUndo() {
        return this._canUndo.peek();
    }
    get canRedo$() {
        return this._canRedo;
    }
    get canUndo$() {
        return this._canUndo;
    }
    get undoManager() {
        return this._history;
    }
    loaded() {
        this._updateCanUndoRedoSignals();
        this._history.on('stack-cleared', this._historyObserver);
        this._history.on('stack-item-added', this._historyObserver);
        this._history.on('stack-item-popped', this._historyObserver);
        this._history.on('stack-item-updated', this._historyObserver);
    }
    disposed() {
        super.disposed();
        this._history.off('stack-cleared', this._historyObserver);
        this._history.off('stack-item-added', this._historyObserver);
        this._history.off('stack-item-popped', this._historyObserver);
        this._history.off('stack-item-updated', this._historyObserver);
        this.onUpdated.complete();
    }
}
