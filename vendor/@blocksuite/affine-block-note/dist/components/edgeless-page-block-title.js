var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { NoteBlockModel } from '@blocksuite/affine-model';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties, ShadowlessElement, stdContext, } from '@blocksuite/std';
import { consume } from '@lit/context';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { NoteConfigExtension } from '../config';
import * as styles from './edgeless-page-block-title.css';
let EdgelessPageBlockTitle = (() => {
    let _classDecorators = [requiredProperties({
            note: PropTypes.instanceOf(NoteBlockModel),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _note_decorators;
    let _note_initializers = [];
    let _note_extraInitializers = [];
    var EdgelessPageBlockTitle = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _std_decorators = [consume({ context: stdContext })];
            _note_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _note_decorators, { kind: "accessor", name: "note", static: false, private: false, access: { has: obj => "note" in obj, get: obj => obj.note, set: (obj, value) => { obj.note = value; } }, metadata: _metadata }, _note_initializers, _note_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EdgelessPageBlockTitle = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        render() {
            if (!this.note.isPageBlock())
                return;
            const title = this.std
                .getOptional(NoteConfigExtension.identifier)
                ?.pageBlockTitle({
                note: this.note,
                std: this.std,
            });
            return html `<div class=${styles.pageBlockTitle}>${title}</div>`;
        }
        #std_accessor_storage = __runInitializers(this, _std_initializers, void 0);
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #note_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _note_initializers, void 0));
        get note() { return this.#note_accessor_storage; }
        set note(value) { this.#note_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _note_extraInitializers);
        }
    };
    return EdgelessPageBlockTitle = _classThis;
})();
export { EdgelessPageBlockTitle };
