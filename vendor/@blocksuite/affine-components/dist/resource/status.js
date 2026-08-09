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
import { fontBaseStyle, panelBaseColorsStyle, } from '@blocksuite/affine-shared/styles';
import { unsafeCSSVar, unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { createButtonPopper, stopPropagation, } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { InformationIcon } from '@blocksuite/icons/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
let ResourceStatus = (() => {
    let _classDecorators = [requiredProperties({
            message: PropTypes.string,
            needUpload: PropTypes.boolean,
            action: PropTypes.instanceOf(Function),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WithDisposable(LitElement);
    let __content_decorators;
    let __content_initializers = [];
    let __content_extraInitializers = [];
    let __trigger_decorators;
    let __trigger_initializers = [];
    let __trigger_extraInitializers = [];
    let __actionButton_decorators;
    let __actionButton_initializers = [];
    let __actionButton_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _needUpload_decorators;
    let _needUpload_initializers = [];
    let _needUpload_extraInitializers = [];
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    var ResourceStatus = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __content_decorators = [query('div.popper')];
            __trigger_decorators = [query('button.status')];
            __actionButton_decorators = [query('button.action')];
            _message_decorators = [property({ attribute: false })];
            _needUpload_decorators = [property({ attribute: false })];
            _action_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __content_decorators, { kind: "accessor", name: "_content", static: false, private: false, access: { has: obj => "_content" in obj, get: obj => obj._content, set: (obj, value) => { obj._content = value; } }, metadata: _metadata }, __content_initializers, __content_extraInitializers);
            __esDecorate(this, null, __trigger_decorators, { kind: "accessor", name: "_trigger", static: false, private: false, access: { has: obj => "_trigger" in obj, get: obj => obj._trigger, set: (obj, value) => { obj._trigger = value; } }, metadata: _metadata }, __trigger_initializers, __trigger_extraInitializers);
            __esDecorate(this, null, __actionButton_decorators, { kind: "accessor", name: "_actionButton", static: false, private: false, access: { has: obj => "_actionButton" in obj, get: obj => obj._actionButton, set: (obj, value) => { obj._actionButton = value; } }, metadata: _metadata }, __actionButton_initializers, __actionButton_extraInitializers);
            __esDecorate(this, null, _message_decorators, { kind: "accessor", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(this, null, _needUpload_decorators, { kind: "accessor", name: "needUpload", static: false, private: false, access: { has: obj => "needUpload" in obj, get: obj => obj.needUpload, set: (obj, value) => { obj.needUpload = value; } }, metadata: _metadata }, _needUpload_initializers, _needUpload_extraInitializers);
            __esDecorate(this, null, _action_decorators, { kind: "accessor", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ResourceStatus = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    button.status {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 18px;
      outline: none;
      border: none;
      cursor: pointer;
      color: ${unsafeCSSVarV2('button/pureWhiteText')};
      background: ${unsafeCSSVarV2('status/error')};
      box-shadow: ${unsafeCSSVar('overlayShadow')};
    }

    ${panelBaseColorsStyle('.popper')}
    ${fontBaseStyle('.popper')}
    .popper {
      display: none;
      outline: none;
      padding: 8px;
      border-radius: 8px;
      width: 260px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      font-size: ${unsafeCSSVar('fontSm')};

      &[data-show] {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    }

    .header {
      font-weight: 500;
    }

    .content {
      font-feature-settings:
        'liga' off,
        'clig' off;
      color: ${unsafeCSSVarV2('text/primary')};
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }

    button.action {
      display: flex;
      align-items: center;
      padding: 2px 12px;
      border-radius: 8px;
      border: none;
      background: none;
      cursor: pointer;
      outline: none;
      color: ${unsafeCSSVarV2('button/primary')};
    }
  `; }
        _updatePopper() {
            this._popper?.dispose();
            this._popper = createButtonPopper({
                reference: this._trigger,
                popperElement: this._content,
                mainAxis: 8,
                allowedPlacements: ['top-start', 'bottom-start'],
            });
        }
        firstUpdated() {
            this._updatePopper();
            this.disposables.addFromEvent(this, 'click', stopPropagation);
            this.disposables.addFromEvent(this, 'keydown', (e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    this._popper?.hide();
                }
            });
            this.disposables.addFromEvent(this._trigger, 'click', (_) => {
                this._popper?.toggle();
            });
            this.disposables.addFromEvent(this._actionButton, 'click', (_) => {
                this._popper?.hide();
                this.action();
            });
            this.disposables.add(() => this._popper?.dispose());
        }
        render() {
            const { message, needUpload } = this;
            const { type, label } = needUpload
                ? {
                    type: 'Upload',
                    label: 'Retry',
                }
                : {
                    type: 'Download',
                    label: 'Reload',
                };
            return html `
      <button class="status">${InformationIcon()}</button>
      <div class="popper">
        <div class="header">${type} failed</div>
        <div class="content">${message}</div>
        <div class="footer">
          <button class="action">${label}</button>
        </div>
      </div>
    `;
        }
        #_content_accessor_storage;
        get _content() { return this.#_content_accessor_storage; }
        set _content(value) { this.#_content_accessor_storage = value; }
        #_trigger_accessor_storage;
        get _trigger() { return this.#_trigger_accessor_storage; }
        set _trigger(value) { this.#_trigger_accessor_storage = value; }
        #_actionButton_accessor_storage;
        get _actionButton() { return this.#_actionButton_accessor_storage; }
        set _actionButton(value) { this.#_actionButton_accessor_storage = value; }
        #message_accessor_storage;
        get message() { return this.#message_accessor_storage; }
        set message(value) { this.#message_accessor_storage = value; }
        #needUpload_accessor_storage;
        get needUpload() { return this.#needUpload_accessor_storage; }
        set needUpload(value) { this.#needUpload_accessor_storage = value; }
        #action_accessor_storage;
        get action() { return this.#action_accessor_storage; }
        set action(value) { this.#action_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._popper = null;
            this.#_content_accessor_storage = __runInitializers(this, __content_initializers, void 0);
            this.#_trigger_accessor_storage = (__runInitializers(this, __content_extraInitializers), __runInitializers(this, __trigger_initializers, void 0));
            this.#_actionButton_accessor_storage = (__runInitializers(this, __trigger_extraInitializers), __runInitializers(this, __actionButton_initializers, void 0));
            this.#message_accessor_storage = (__runInitializers(this, __actionButton_extraInitializers), __runInitializers(this, _message_initializers, void 0));
            this.#needUpload_accessor_storage = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _needUpload_initializers, void 0));
            this.#action_accessor_storage = (__runInitializers(this, _needUpload_extraInitializers), __runInitializers(this, _action_initializers, void 0));
            __runInitializers(this, _action_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return ResourceStatus = _classThis;
})();
export { ResourceStatus };
