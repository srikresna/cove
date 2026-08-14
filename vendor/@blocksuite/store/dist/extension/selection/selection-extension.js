import { BlockSuiteError, ErrorCode } from "@blocksuite/global/exceptions";
import { computed, signal } from "@preact/signals-core";
import { Subject } from "rxjs";
import { nanoid } from "../../utils/id-generator";
import { StoreExtension } from "../store-extension";
import { SelectionIdentifier } from "./identifier";
export class StoreSelectionExtension extends StoreExtension {
  constructor() {
    super(...arguments);
    this._id = `${this.store.id}:${nanoid()}`;
    this._selectionConstructors = {};
    this._selections = signal([]);
    this._remoteSelections = signal(new Map());
    this._itemAdded = (event) => {
      event.stackItem.meta.set("selection-state", this._selections.value);
    };
    this._itemPopped = (event) => {
      const selection = event.stackItem.meta.get("selection-state");
      if (selection) {
        this.set(selection);
      }
    };
    this._jsonToSelection = (json) => {
      const ctor = this._selectionConstructors[json.type];
      if (!ctor) {
        throw new BlockSuiteError(ErrorCode.SelectionError, `Unknown selection type: ${json.type}`);
      }
      return ctor.fromJSON(json);
    };
    this.slots = {
      changed: new Subject(),
      remoteChanged: new Subject(),
    };
  }
  static {
    this.key = "selection";
  }
  loaded() {
    this.store.provider.getAll(SelectionIdentifier).forEach((ctor) => {
      [ctor].flat().forEach((ctor) => {
        this._selectionConstructors[ctor.type] = ctor;
      });
    });
    this.store.awarenessStore.awareness.on("change", (change) => {
      const all = change.updated.concat(change.added).concat(change.removed);
      const localClientID = this.store.awarenessStore.awareness.clientID;
      const exceptLocal = all.filter((id) => id !== localClientID);
      // Only consider remote selections from other clients
      if (exceptLocal.length > 0) {
        const map = new Map();
        this.store.awarenessStore.getStates().forEach((state, id) => {
          if (id === this.store.awarenessStore.awareness.clientID) return;
          // selection id starts with the same block collection id from others clients would be considered as remote selections
          const selection = Object.entries(state.selectionV2)
            .filter(([key]) => key.startsWith(this.store.id))
            .flatMap(([_, selection]) => selection);
          const selections = selection
            .map((json) => {
              try {
                return this._jsonToSelection(json);
              } catch (error) {
                console.error("Parse remote selection failed:", id, json, error);
                return null;
              }
            })
            .filter((sel) => !!sel);
          map.set(id, selections);
        });
        this._remoteSelections.value = map;
        this.slots.remoteChanged.next(map);
      }
    });
    this.store.history.undoManager.on("stack-item-added", this._itemAdded);
    this.store.history.undoManager.on("stack-item-popped", this._itemPopped);
  }
  disposed() {
    super.disposed();
    this.store.history.undoManager.off("stack-item-added", this._itemAdded);
    this.store.history.undoManager.off("stack-item-popped", this._itemPopped);
  }
  get value() {
    return this._selections.value;
  }
  get remoteSelections() {
    return this._remoteSelections.value;
  }
  clear(types) {
    if (types) {
      const values = this.value.filter((selection) => !types.includes(selection.type));
      this.set(values);
    } else {
      this.set([]);
    }
  }
  create(Type, ...args) {
    return new Type(...args);
  }
  getGroup(group) {
    return this.value.filter((s) => s.group === group);
  }
  filter(type) {
    return this.filter$(type).value;
  }
  filter$(type) {
    return computed(() => this.value.filter((sel) => sel.is(type)));
  }
  find(type) {
    return this.find$(type).value;
  }
  find$(type) {
    return computed(() => this.value.find((sel) => sel.is(type)));
  }
  set(selections) {
    this.store.awarenessStore.setLocalSelection(
      this._id,
      selections.map((s) => s.toJSON()),
    );
    this._selections.value = selections;
    this.slots.changed.next(selections);
  }
  setGroup(group, selections) {
    const current = this.value.filter((s) => s.group !== group);
    this.set([...current, ...selections]);
  }
  // This method is used to clear **current editor's remote selections**
  // When the editor is not active, the remote selections should be cleared
  // So other editors won't see the remote selections from this editor
  clearRemote() {
    this.store.awarenessStore.setLocalSelection(this._id, []);
  }
  update(fn) {
    const selections = fn(this.value);
    this.set(selections);
  }
  fromJSON(json) {
    const selections = json.map((json) => {
      return this._jsonToSelection(json);
    });
    return this.set(selections);
  }
}
