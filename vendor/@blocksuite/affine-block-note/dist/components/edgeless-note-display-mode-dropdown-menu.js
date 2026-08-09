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
import { EditorChevronDown } from '@blocksuite/affine-components/toolbar';
import { NoteDisplayMode } from '@blocksuite/affine-model';
import { ShadowlessElement } from '@blocksuite/std';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
const DisplayModeMap = {
    [NoteDisplayMode.DocAndEdgeless]: 'Both',
    [NoteDisplayMode.EdgelessOnly]: 'Edgeless',
    [NoteDisplayMode.DocOnly]: 'Page',
};
let EdgelessNoteDisplayModeDropdownMenu = (() => {
    let _classSuper = ShadowlessElement;
    let _displayMode_decorators;
    let _displayMode_initializers = [];
    let _displayMode_extraInitializers = [];
    return class EdgelessNoteDisplayModeDropdownMenu extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _displayMode_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _displayMode_decorators, { kind: "accessor", name: "displayMode", static: false, private: false, access: { has: obj => "displayMode" in obj, get: obj => obj.displayMode, set: (obj, value) => { obj.displayMode = value; } }, metadata: _metadata }, _displayMode_initializers, _displayMode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get mode() {
            return DisplayModeMap[this.displayMode];
        }
        select(detail) {
            this.dispatchEvent(new CustomEvent('select', { detail }));
        }
        render() {
            const { displayMode, mode } = this;
            return html `
      <span class="display-mode-button-label">Show in</span>
      <editor-menu-button
        .contentPadding=${'8px'}
        .button=${html `
          <editor-icon-button
            aria-label="Mode"
            .tooltip="${'Display mode'}"
            .justify="${'space-between'}"
            .labelHeight="${'20px'}"
          >
            <span class="label">${mode}</span>
            ${EditorChevronDown}
          </editor-icon-button>
        `}
      >
        <note-display-mode-panel
          .displayMode=${displayMode}
          .onSelect=${(newMode) => this.select(newMode)}
        >
        </note-display-mode-panel>
      </editor-menu-button>
    `;
        }
        #displayMode_accessor_storage = __runInitializers(this, _displayMode_initializers, void 0);
        get displayMode() { return this.#displayMode_accessor_storage; }
        set displayMode(value) { this.#displayMode_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _displayMode_extraInitializers);
        }
    };
})();
export { EdgelessNoteDisplayModeDropdownMenu };
