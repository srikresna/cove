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
import { createPopup, menu, popMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { rangeWrap } from '@blocksuite/affine-shared/utils';
import { IS_MOBILE } from '@blocksuite/global/env';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { CloseIcon, DeleteIcon, MoreHorizontalIcon, } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { nanoid } from '@blocksuite/store';
import { autoPlacement, offset, shift } from '@floating-ui/dom';
import { computed, signal } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';
import { stopPropagation } from '../../utils/event.js';
import { dragHandler } from '../../utils/wc-dnd/dnd-context.js';
import { defaultActivators } from '../../utils/wc-dnd/sensors/index.js';
import { createSortContext, sortable, } from '../../utils/wc-dnd/sort/sort-context.js';
import { verticalListSortingStrategy } from '../../utils/wc-dnd/sort/strategies/index.js';
import { arrayMove } from '../../utils/wc-dnd/utils/array-move.js';
import { getTagColor, selectOptionColors } from './colors.js';
import { selectedStyle, selectOptionContentStyle, selectOptionDragHandlerStyle, selectOptionIconStyle, selectOptionNewIconStyle, selectOptionsContainerStyle, selectOptionsTipsStyle, selectOptionStyle, tagContainerStyle, tagDeleteIconStyle, tagSelectContainerStyle, tagSelectInputContainerStyle, tagSelectInputStyle, tagTextStyle, } from './styles-css.js';
// parent elements that can consume tag draft
const TABLE_CELL_HOST_SELECTOR = 'dv-table-view-cell-container, affine-database-virtual-cell-container';
export function consumeTagDraftFromTableCellHost(fromElement) {
    const host = fromElement.closest(TABLE_CELL_HOST_SELECTOR);
    return host?.consumeTagDraft?.();
}
class TagManager {
    get isSingleMode() {
        return this.ops.mode === 'single';
    }
    get options$() {
        return this.ops.options;
    }
    get value$() {
        return this.ops.value;
    }
    constructor(ops) {
        this.ops = ops;
        this.changeTag = (option) => {
            this.ops.onOptionsChange(this.ops.options.value.map(item => {
                if (item.id === option.id) {
                    return {
                        ...item,
                        ...option,
                    };
                }
                return item;
            }));
        };
        this.color$ = signal(getTagColor());
        this.createOption = () => {
            const value = this.text$.value.trim();
            if (value === '')
                return;
            const id = nanoid();
            this.ops.onOptionsChange([
                {
                    id: id,
                    value: value,
                    color: this.color$.value,
                },
                ...this.ops.options.value,
            ]);
            this.selectTag(id);
            this.text$.value = '';
            this.color$.value = getTagColor();
            if (this.isSingleMode) {
                this.ops.onComplete?.();
            }
        };
        this.deleteOption = (id) => {
            this.ops.onOptionsChange(this.ops.options.value.filter(item => item.id !== id));
        };
        this.filteredOptions$ = computed(() => {
            let matched = false;
            const options = [];
            for (const option of this.options$.value) {
                if (!this.text$.value ||
                    option.value
                        .toLocaleLowerCase()
                        .includes(this.text$.value.toLocaleLowerCase())) {
                    options.push({
                        ...option,
                        isCreate: false,
                        select: () => this.selectTag(option.id),
                    });
                }
                if (option.value === this.text$.value) {
                    matched = true;
                }
            }
            if (this.text$.value && !matched) {
                options.push({
                    id: 'create',
                    color: this.color$.value,
                    value: this.text$.value,
                    isCreate: true,
                    select: this.createOption,
                });
            }
            return options;
        });
        this.optionsMap$ = computed(() => {
            return new Map(this.ops.options.value.map(v => [v.id, v]));
        });
        this.text$ = signal('');
    }
    deleteTag(id) {
        this.ops.onChange(this.value$.value.filter(item => item !== id));
    }
    isSelected(id) {
        return this.value$.value.includes(id);
    }
    selectTag(id) {
        if (!this.isSingleMode && this.isSelected(id)) {
            return;
        }
        const newValue = this.isSingleMode ? [id] : [...this.value$.value, id];
        this.ops.onChange(newValue);
        this.text$.value = '';
        if (this.isSingleMode) {
            requestAnimationFrame(() => {
                this.ops.onComplete?.();
            });
        }
    }
}
let MultiTagSelect = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _mode_decorators;
    let _mode_initializers = [];
    let _mode_extraInitializers = [];
    let _onChange_decorators;
    let _onChange_initializers = [];
    let _onChange_extraInitializers = [];
    let _onComplete_decorators;
    let _onComplete_initializers = [];
    let _onComplete_extraInitializers = [];
    let _onOptionsChange_decorators;
    let _onOptionsChange_initializers = [];
    let _onOptionsChange_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _initialDraftText_decorators;
    let _initialDraftText_initializers = [];
    let _initialDraftText_extraInitializers = [];
    return class MultiTagSelect extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _mode_decorators = [property()];
            _onChange_decorators = [property({ attribute: false })];
            _onComplete_decorators = [property({ attribute: false })];
            _onOptionsChange_decorators = [property({ attribute: false })];
            _options_decorators = [property({ attribute: false })];
            _value_decorators = [property({ attribute: false })];
            _initialDraftText_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _mode_decorators, { kind: "accessor", name: "mode", static: false, private: false, access: { has: obj => "mode" in obj, get: obj => obj.mode, set: (obj, value) => { obj.mode = value; } }, metadata: _metadata }, _mode_initializers, _mode_extraInitializers);
            __esDecorate(this, null, _onChange_decorators, { kind: "accessor", name: "onChange", static: false, private: false, access: { has: obj => "onChange" in obj, get: obj => obj.onChange, set: (obj, value) => { obj.onChange = value; } }, metadata: _metadata }, _onChange_initializers, _onChange_extraInitializers);
            __esDecorate(this, null, _onComplete_decorators, { kind: "accessor", name: "onComplete", static: false, private: false, access: { has: obj => "onComplete" in obj, get: obj => obj.onComplete, set: (obj, value) => { obj.onComplete = value; } }, metadata: _metadata }, _onComplete_initializers, _onComplete_extraInitializers);
            __esDecorate(this, null, _onOptionsChange_decorators, { kind: "accessor", name: "onOptionsChange", static: false, private: false, access: { has: obj => "onOptionsChange" in obj, get: obj => obj.onOptionsChange, set: (obj, value) => { obj.onOptionsChange = value; } }, metadata: _metadata }, _onOptionsChange_initializers, _onOptionsChange_extraInitializers);
            __esDecorate(this, null, _options_decorators, { kind: "accessor", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(this, null, _initialDraftText_decorators, { kind: "accessor", name: "initialDraftText", static: false, private: false, access: { has: obj => "initialDraftText" in obj, get: obj => obj.initialDraftText, set: (obj, value) => { obj.initialDraftText = value; } }, metadata: _metadata }, _initialDraftText_initializers, _initialDraftText_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get text() {
            return this.tagManager.text$;
        }
        renderInput() {
            return html `
      <div class="${tagSelectInputContainerStyle}">
        ${this.value.value.map(id => {
                const option = this.tagManager.optionsMap$.value.get(id);
                if (!option) {
                    return null;
                }
                return this.renderTag(option.value, option.color, () => this.tagManager.deleteTag(id));
            })}
        <input
          class="${tagSelectInputStyle}"
          ${ref(this._selectInput)}
          placeholder="Type here..."
          .value="${this.text.value}"
          @input="${this._onInput}"
          @keydown="${this._onInputKeydown}"
          @pointerdown="${stopPropagation}"
        />
      </div>
    `;
        }
        renderTag(name, color, onDelete) {
            const style = styleMap({
                backgroundColor: color,
            });
            return html ` <div class="${tagContainerStyle}" style=${style}>
      <div data-testid="tag-name" class="${tagTextStyle}">${name}</div>
      ${onDelete
                ? html ` <div class="${tagDeleteIconStyle}" @click="${onDelete}">
            ${CloseIcon()}
          </div>`
                : nothing}
    </div>`;
        }
        renderTags() {
            return html `
      <div
        style="height: 0.5px;background-color: ${cssVarV2('layer/insideBorder/border')};margin: 4px 0;"
      ></div>
      <div class="${selectOptionsTipsStyle}">Select tag or create one</div>
      <div data-testid="tag-option-list" class="${selectOptionsContainerStyle}">
        ${repeat(this.tagManager.filteredOptions$.value, select => select.id, (select, index) => {
                const isSelected = index === this.selectedIndex$.value;
                const mouseenter = () => {
                    this.setSelectedOption(index);
                };
                const classes = classMap({
                    [selectOptionStyle]: true,
                    [selectedStyle]: isSelected,
                });
                const clickOption = (e) => {
                    e.stopPropagation();
                    this._clickItemOption(e, select.id);
                };
                return html `
              <div
                ${!select.isCreate ? sortable(select.id) : nothing}
                class="${classes}"
                @mouseenter="${mouseenter}"
                @click="${select.select}"
              >
                <div class="${selectOptionContentStyle}">
                  ${select.isCreate
                    ? html ` <div class="${selectOptionNewIconStyle}">
                        Create
                      </div>`
                    : html `
                        <div
                          ${dragHandler(select.id)}
                          class="${selectOptionDragHandlerStyle}"
                        ></div>
                      `}
                  ${this.renderTag(select.value, select.color)}
                </div>
                ${!select.isCreate
                    ? html ` <div
                      class="${selectOptionIconStyle}"
                      @click="${clickOption}"
                      data-testid="option-more"
                    >
                      ${MoreHorizontalIcon()}
                    </div>`
                    : null}
              </div>
            `;
            })}
      </div>
    `;
        }
        setSelectedOption(index) {
            this.selectedIndex$.value = rangeWrap(index, 0, this.tagManager.filteredOptions$.value.length);
        }
        connectedCallback() {
            super.connectedCallback();
            const draft = this.initialDraftText;
            if (draft != null && draft !== '') {
                this.tagManager.text$.value = draft;
                this.initialDraftText = undefined;
            }
        }
        firstUpdated() {
            const disposables = this.disposables;
            this.classList.add(tagSelectContainerStyle);
            requestAnimationFrame(() => {
                this._selectInput.value?.focus();
            });
            disposables.addFromEvent(this, 'click', () => {
                this._selectInput.value?.focus();
            });
            disposables.addFromEvent(this._selectInput.value, 'copy', e => {
                e.stopPropagation();
            });
            disposables.addFromEvent(this._selectInput.value, 'cut', e => {
                e.stopPropagation();
            });
        }
        render() {
            this.setSelectedOption(this.selectedIndex$.value);
            return html ` ${this.renderInput()} ${this.renderTags()} `;
        }
        #mode_accessor_storage;
        get mode() { return this.#mode_accessor_storage; }
        set mode(value) { this.#mode_accessor_storage = value; }
        #onChange_accessor_storage;
        get onChange() { return this.#onChange_accessor_storage; }
        set onChange(value) { this.#onChange_accessor_storage = value; }
        #onComplete_accessor_storage;
        get onComplete() { return this.#onComplete_accessor_storage; }
        set onComplete(value) { this.#onComplete_accessor_storage = value; }
        #onOptionsChange_accessor_storage;
        get onOptionsChange() { return this.#onOptionsChange_accessor_storage; }
        set onOptionsChange(value) { this.#onOptionsChange_accessor_storage = value; }
        #options_accessor_storage;
        get options() { return this.#options_accessor_storage; }
        set options(value) { this.#options_accessor_storage = value; }
        #value_accessor_storage;
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        #initialDraftText_accessor_storage;
        get initialDraftText() { return this.#initialDraftText_accessor_storage; }
        set initialDraftText(value) { this.#initialDraftText_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._clickItemOption = (e, id) => {
                e.stopPropagation();
                const option = this.options.value.find(v => v.id === id);
                if (!option) {
                    return;
                }
                popMenu(popupTargetFromElement(e.currentTarget), {
                    options: {
                        items: [
                            menu.input({
                                initialValue: option.value,
                                onChange: text => {
                                    this.tagManager.changeTag({
                                        id: option.id,
                                        value: text,
                                    });
                                },
                            }),
                            menu.action({
                                name: 'Delete',
                                prefix: DeleteIcon(),
                                class: {
                                    'delete-item': true,
                                },
                                select: () => {
                                    this.tagManager.deleteOption(id);
                                },
                            }),
                            menu.group({
                                name: 'color',
                                items: selectOptionColors.map(item => {
                                    const styles = styleMap({
                                        backgroundColor: item.color,
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                    });
                                    return menu.action({
                                        name: item.name,
                                        prefix: html ` <div style=${styles}></div>`,
                                        isSelected: option.color === item.color,
                                        select: () => {
                                            this.tagManager.changeTag({
                                                id: option.id,
                                                color: item.color,
                                            });
                                        },
                                    });
                                }),
                            }),
                        ],
                    },
                });
            };
            this._onInput = (event) => {
                this.tagManager.text$.value = event.target.value;
            };
            this._onInputKeydown = (event) => {
                event.stopPropagation();
                const inputValue = this.text.value.trim();
                if (event.key === 'Backspace' && inputValue === '') {
                    const lastId = this.value.value[this.value.value.length - 1];
                    if (lastId) {
                        this.tagManager.deleteTag(lastId);
                    }
                }
                else if (event.key === 'Enter' && !event.isComposing) {
                    this.selectedTag$.value?.select();
                }
                else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    this.setSelectedOption(this.selectedIndex$.value - 1);
                }
                else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    this.setSelectedOption(this.selectedIndex$.value + 1);
                }
                else if (event.key === 'Escape') {
                    this.onComplete();
                }
            };
            this.tagManager = new TagManager(this);
            this.selectedTag$ = computed(() => {
                return this.tagManager.filteredOptions$.value[this.selectedIndex$.value];
            });
            this.sortContext = createSortContext({
                activators: defaultActivators,
                container: this,
                onDragEnd: evt => {
                    const over = evt.over;
                    const activeId = evt.active.id;
                    if (over && over.id !== activeId) {
                        this.onOptionsChange(arrayMove(this.options.value, this.options.value.findIndex(v => v.id === activeId), this.options.value.findIndex(v => v.id === over.id)));
                        this.requestUpdate();
                        // const properties = this.filteredOptions$.value.map(v=>v.id);
                        // const activeIndex = properties.findIndex(id => id === activeId);
                        // const overIndex = properties.findIndex(id => id === over.id);
                    }
                },
                modifiers: [
                    ({ transform }) => {
                        return {
                            ...transform,
                            x: 0,
                        };
                    },
                ],
                items: computed(() => {
                    return this.tagManager.filteredOptions$.value.map(v => v.id);
                }),
                strategy: verticalListSortingStrategy,
            });
            this._selectInput = createRef();
            this.#mode_accessor_storage = __runInitializers(this, _mode_initializers, 'multi');
            this.#onChange_accessor_storage = (__runInitializers(this, _mode_extraInitializers), __runInitializers(this, _onChange_initializers, void 0));
            this.#onComplete_accessor_storage = (__runInitializers(this, _onChange_extraInitializers), __runInitializers(this, _onComplete_initializers, void 0));
            this.#onOptionsChange_accessor_storage = (__runInitializers(this, _onComplete_extraInitializers), __runInitializers(this, _onOptionsChange_initializers, void 0));
            this.#options_accessor_storage = (__runInitializers(this, _onOptionsChange_extraInitializers), __runInitializers(this, _options_initializers, void 0));
            this.selectedIndex$ = (__runInitializers(this, _options_extraInitializers), signal(0));
            this.#value_accessor_storage = __runInitializers(this, _value_initializers, void 0);
            this.#initialDraftText_accessor_storage = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _initialDraftText_initializers, void 0));
            __runInitializers(this, _initialDraftText_extraInitializers);
        }
    };
})();
export { MultiTagSelect };
const popMobileTagSelect = (target, ops) => {
    const tagManager = new TagManager(ops);
    if (ops.initialDraftText) {
        tagManager.text$.value = ops.initialDraftText;
    }
    const onInput = (e) => {
        tagManager.text$.value = e.target.value;
    };
    const onKeydown = (e) => {
        e.stopPropagation();
        const inputValue = e.target.value.trim();
        if (e.key === 'Backspace' && inputValue === '') {
            const values = tagManager.value$.value;
            const lastId = values[values.length - 1];
            if (lastId) {
                e.preventDefault();
                tagManager.deleteTag(lastId);
            }
        }
    };
    return popMenu(target, {
        options: {
            onClose: () => {
                ops.onComplete?.();
            },
            title: {
                text: ops.name,
            },
            items: [
                () => {
                    return html `
            <div
              style="padding: 12px;border-radius: 12px;background-color: ${unsafeCSSVarV2('layer/background/primary')};display: flex;gap:8px 12px;"
            >
              ${ops.value.value.map(id => {
                        const option = ops.options.value.find(v => v.id === id);
                        if (!option) {
                            return null;
                        }
                        const style = styleMap({
                            backgroundColor: option.color,
                            width: 'max-content',
                        });
                        return html ` <div class="${tagContainerStyle}" style=${style}>
                  <div class="${tagTextStyle}">${option.value}</div>
                  <div
                    class="${tagDeleteIconStyle}"
                    @click="${(e) => {
                            e.stopPropagation();
                            tagManager.deleteTag(id);
                        }}"
                  >
                    ${CloseIcon()}
                  </div>
                </div>`;
                    })}
              <input
                .value="${tagManager.text$.value}"
                @input="${onInput}"
                @keydown="${onKeydown}"
                placeholder="Type here..."
                type="text"
                style="outline: none;border: none;flex:1;min-width: 10px"
              />
            </div>
          `;
                },
                menu.group({
                    items: [
                        menu.dynamic(() => {
                            const options = tagManager.filteredOptions$.value;
                            return options.map(option => menu.action({
                                name: option.value,
                                label: () => {
                                    const style = styleMap({
                                        backgroundColor: option.color,
                                        width: 'max-content',
                                    });
                                    return html `
                      <div style="display: flex; align-items:center;">
                        ${option.isCreate
                                        ? html ` <div style="margin-right: 8px;">Create</div>`
                                        : ''}
                        <div class="${tagContainerStyle}" style=${style}>
                          <div class="${tagTextStyle}">${option.value}</div>
                        </div>
                      </div>
                    `;
                                },
                                select: () => {
                                    option.select();
                                    return false;
                                },
                            }));
                        }),
                    ],
                }),
            ],
        },
    });
};
export const popTagSelect = (target, ops) => {
    if (IS_MOBILE) {
        const handler = popMobileTagSelect(target, ops);
        return () => {
            handler.close();
        };
    }
    const component = new MultiTagSelect();
    if (ops.mode) {
        component.mode = ops.mode;
    }
    const width = target.targetRect.getBoundingClientRect().width;
    component.style.width = `${Math.max(ops.minWidth ?? width, width)}px`;
    component.value = ops.value;
    component.onChange = ops.onChange;
    component.options = ops.options;
    component.onOptionsChange = ops.onOptionsChange;
    component.initialDraftText = ops.initialDraftText;
    component.onComplete = () => {
        ops.onComplete?.();
        remove();
    };
    const remove = createPopup(target, component, {
        onClose: ops.onComplete,
        middleware: [
            autoPlacement({
                allowedPlacements: [
                    'bottom-start',
                    'bottom-end',
                    'top-start',
                    'top-end',
                ],
            }),
            offset({ mainAxis: -36 }),
            shift(),
        ],
        container: ops.container,
    });
    return remove;
};
