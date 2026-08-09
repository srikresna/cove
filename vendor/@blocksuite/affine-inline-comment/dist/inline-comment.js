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
import { CommentProviderIdentifier, } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties, ShadowlessElement, stdContext, } from '@blocksuite/std';
import { consume } from '@lit/context';
import { css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { html } from 'lit-html';
import { isEqual } from 'lodash-es';
let InlineComment = (() => {
    let _classDecorators = [requiredProperties({
            commentIds: PropTypes.arrayOf(id => typeof id === 'string'),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WithDisposable(ShadowlessElement);
    let _commentIds_decorators;
    let _commentIds_initializers = [];
    let _commentIds_extraInitializers = [];
    let _unresolved_decorators;
    let _unresolved_initializers = [];
    let _unresolved_extraInitializers = [];
    let __std_decorators;
    let __std_initializers = [];
    let __std_extraInitializers = [];
    let _highlighted_decorators;
    let _highlighted_initializers = [];
    let _highlighted_extraInitializers = [];
    var InlineComment = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#commentIds_accessor_storage = __runInitializers(this, _commentIds_initializers, void 0);
            this.#unresolved_accessor_storage = (__runInitializers(this, _commentIds_extraInitializers), __runInitializers(this, _unresolved_initializers, false));
            this._index = (__runInitializers(this, _unresolved_extraInitializers), 0);
            this.#_std_accessor_storage = __runInitializers(this, __std_initializers, void 0);
            this.#highlighted_accessor_storage = (__runInitializers(this, __std_extraInitializers), __runInitializers(this, _highlighted_initializers, false));
            this._handleClick = (__runInitializers(this, _highlighted_extraInitializers), () => {
                if (this.unresolved) {
                    this._provider?.highlightComment(this.commentIds[this._index]);
                    this._index = (this._index + 1) % this.commentIds.length;
                }
            });
            this._handleHighlight = (id) => {
                if (this.highlighted) {
                    if (!id || !this.commentIds.includes(id)) {
                        this.highlighted = false;
                    }
                }
                else {
                    if (id && this.commentIds.includes(id)) {
                        this.highlighted = true;
                    }
                }
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _commentIds_decorators = [property({
                    attribute: false,
                    hasChanged: (newVal, oldVal) => !isEqual(newVal, oldVal),
                })];
            _unresolved_decorators = [property({ attribute: false })];
            __std_decorators = [consume({ context: stdContext })];
            _highlighted_decorators = [state()];
            __esDecorate(this, null, _commentIds_decorators, { kind: "accessor", name: "commentIds", static: false, private: false, access: { has: obj => "commentIds" in obj, get: obj => obj.commentIds, set: (obj, value) => { obj.commentIds = value; } }, metadata: _metadata }, _commentIds_initializers, _commentIds_extraInitializers);
            __esDecorate(this, null, _unresolved_decorators, { kind: "accessor", name: "unresolved", static: false, private: false, access: { has: obj => "unresolved" in obj, get: obj => obj.unresolved, set: (obj, value) => { obj.unresolved = value; } }, metadata: _metadata }, _unresolved_initializers, _unresolved_extraInitializers);
            __esDecorate(this, null, __std_decorators, { kind: "accessor", name: "_std", static: false, private: false, access: { has: obj => "_std" in obj, get: obj => obj._std, set: (obj, value) => { obj._std = value; } }, metadata: _metadata }, __std_initializers, __std_extraInitializers);
            __esDecorate(this, null, _highlighted_decorators, { kind: "accessor", name: "highlighted", static: false, private: false, access: { has: obj => "highlighted" in obj, get: obj => obj.highlighted, set: (obj, value) => { obj.highlighted = value; } }, metadata: _metadata }, _highlighted_initializers, _highlighted_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            InlineComment = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    inline-comment {
      display: inline;
    }

    inline-comment.unresolved {
      background-color: ${unsafeCSSVarV2('block/comment/highlightDefault')};
      border-bottom: 2px solid
        ${unsafeCSSVarV2('block/comment/highlightUnderline')};
    }

    inline-comment.highlighted {
      background-color: ${unsafeCSSVarV2('block/comment/highlightActive')};
    }
  `; }
        #commentIds_accessor_storage;
        get commentIds() { return this.#commentIds_accessor_storage; }
        set commentIds(value) { this.#commentIds_accessor_storage = value; }
        #unresolved_accessor_storage;
        get unresolved() { return this.#unresolved_accessor_storage; }
        set unresolved(value) { this.#unresolved_accessor_storage = value; }
        #_std_accessor_storage;
        get _std() { return this.#_std_accessor_storage; }
        set _std(value) { this.#_std_accessor_storage = value; }
        #highlighted_accessor_storage;
        get highlighted() { return this.#highlighted_accessor_storage; }
        set highlighted(value) { this.#highlighted_accessor_storage = value; }
        get _provider() {
            return this._std.getOptional(CommentProviderIdentifier);
        }
        connectedCallback() {
            super.connectedCallback();
            const provider = this._provider;
            if (provider) {
                this.disposables.addFromEvent(this, 'click', this._handleClick);
                this.disposables.add(provider.onCommentHighlighted(this._handleHighlight));
            }
        }
        willUpdate(_changedProperties) {
            if (_changedProperties.has('highlighted')) {
                if (this.highlighted) {
                    this.classList.add('highlighted');
                }
                else {
                    this.classList.remove('highlighted');
                }
            }
            if (_changedProperties.has('unresolved')) {
                if (this.unresolved) {
                    this.classList.add('unresolved');
                }
                else {
                    this.classList.remove('unresolved');
                }
            }
        }
        render() {
            return html `<slot></slot>`;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return InlineComment = _classThis;
})();
export { InlineComment };
