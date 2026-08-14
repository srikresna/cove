var _a;
import { computed, signal } from "@preact/signals-core";
import { Subject } from "rxjs";
import { take } from "rxjs/operators";
const modelLabel = Symbol("model_label");
export class BlockModel {
  isEmpty() {
    return this.children.length === 0;
  }
  get text() {
    return this.props.text;
  }
  set text(text) {
    if (this.keys.includes("text")) {
      this.props.text = text;
    }
  }
  get props() {
    if (!this._props) {
      throw new Error("props is only supported in flat data model");
    }
    return this._props;
  }
  get flavour() {
    return this.schema.model.flavour;
  }
  get version() {
    return this.schema.version;
  }
  get children() {
    return this._childModels.value;
  }
  get store() {
    return this._store;
  }
  set store(doc) {
    this._store = doc;
  }
  get parent() {
    return this.store.getParent(this);
  }
  get role() {
    return this.schema.model.role;
  }
  constructor() {
    this._children = signal([]);
    this._childModels = computed(() => {
      const value = [];
      this._children.value.forEach((id) => {
        const block = this._store.getBlock$(id);
        if (block) {
          value.push(block.model);
        }
      });
      return value;
    });
    this.childMap = computed(() =>
      this._children.value.reduce((map, id, index) => {
        map.set(id, index);
        return map;
      }, new Map()),
    );
    this.created = new Subject();
    this.deleted = new Subject();
    // This is used to avoid https://stackoverflow.com/questions/55886792/infer-typescript-generic-class-type
    this[_a] = "type_info_label";
    this.propsUpdated = new Subject();
    this._onCreated = {
      dispose: this.created.pipe(take(1)).subscribe(() => {
        this._children.value = this.yBlock.get("sys:children").toArray();
        this.yBlock.get("sys:children").observe((event) => {
          this._children.value = event.target.toArray();
        });
        this.yBlock.observe((event) => {
          if (event.keysChanged.has("sys:children")) {
            this._children.value = this.yBlock.get("sys:children").toArray();
          }
        });
      }).unsubscribe,
    };
    this._onDeleted = {
      dispose: this.deleted.pipe(take(1)).subscribe(() => {
        this._onCreated.dispose();
      }).unsubscribe,
    };
  }
  dispose() {
    this.created.complete();
    this.deleted.complete();
    this.propsUpdated.complete();
  }
  firstChild() {
    return this.children[0] || null;
  }
  lastChild() {
    if (!this.children.length) {
      return this;
    }
    return this.children[this.children.length - 1].lastChild();
  }
  [((_a = modelLabel), Symbol.dispose)]() {
    this._onCreated.dispose();
    this._onDeleted.dispose();
  }
}
