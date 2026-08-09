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
import { LoadingIcon } from '@blocksuite/affine-components/icons';
import { cleanSpecifiedTail, getTextContentFromInlineRange, } from '@blocksuite/affine-rich-text';
import { unsafeCSSVar } from '@blocksuite/affine-shared/theme';
import { createKeydownObserver, getPopperPosition, getViewportElement, } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { MoreHorizontalIcon } from '@blocksuite/icons/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { effect } from '@preact/signals-core';
import { css, html, LitElement, nothing } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import throttle from 'lodash-es/throttle';
import { linkedDocPopoverStyles } from './styles.js';
import { resolveSignal } from './utils.js';
let LinkedDocPopover = (() => {
    let _classDecorators = [requiredProperties({
            context: PropTypes.object,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let __activatedItemKey_decorators;
    let __activatedItemKey_initializers = [];
    let __activatedItemKey_extraInitializers = [];
    let __linkedDocGroup_decorators;
    let __linkedDocGroup_initializers = [];
    let __linkedDocGroup_extraInitializers = [];
    let __position_decorators;
    let __position_initializers = [];
    let __position_extraInitializers = [];
    let __showTooltip_decorators;
    let __showTooltip_initializers = [];
    let __showTooltip_extraInitializers = [];
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _iconButtons_decorators;
    let _iconButtons_initializers = [];
    let _iconButtons_extraInitializers = [];
    let _linkedDocElement_decorators;
    let _linkedDocElement_initializers = [];
    let _linkedDocElement_extraInitializers = [];
    var LinkedDocPopover = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __activatedItemKey_decorators = [state()];
            __linkedDocGroup_decorators = [state()];
            __position_decorators = [state()];
            __showTooltip_decorators = [state()];
            _context_decorators = [property({ attribute: false })];
            _iconButtons_decorators = [queryAll('icon-button')];
            _linkedDocElement_decorators = [query('.linked-doc-popover')];
            __esDecorate(this, null, __activatedItemKey_decorators, { kind: "accessor", name: "_activatedItemKey", static: false, private: false, access: { has: obj => "_activatedItemKey" in obj, get: obj => obj._activatedItemKey, set: (obj, value) => { obj._activatedItemKey = value; } }, metadata: _metadata }, __activatedItemKey_initializers, __activatedItemKey_extraInitializers);
            __esDecorate(this, null, __linkedDocGroup_decorators, { kind: "accessor", name: "_linkedDocGroup", static: false, private: false, access: { has: obj => "_linkedDocGroup" in obj, get: obj => obj._linkedDocGroup, set: (obj, value) => { obj._linkedDocGroup = value; } }, metadata: _metadata }, __linkedDocGroup_initializers, __linkedDocGroup_extraInitializers);
            __esDecorate(this, null, __position_decorators, { kind: "accessor", name: "_position", static: false, private: false, access: { has: obj => "_position" in obj, get: obj => obj._position, set: (obj, value) => { obj._position = value; } }, metadata: _metadata }, __position_initializers, __position_extraInitializers);
            __esDecorate(this, null, __showTooltip_decorators, { kind: "accessor", name: "_showTooltip", static: false, private: false, access: { has: obj => "_showTooltip" in obj, get: obj => obj._showTooltip, set: (obj, value) => { obj._showTooltip = value; } }, metadata: _metadata }, __showTooltip_initializers, __showTooltip_extraInitializers);
            __esDecorate(this, null, _context_decorators, { kind: "accessor", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(this, null, _iconButtons_decorators, { kind: "accessor", name: "iconButtons", static: false, private: false, access: { has: obj => "iconButtons" in obj, get: obj => obj.iconButtons, set: (obj, value) => { obj.iconButtons = value; } }, metadata: _metadata }, _iconButtons_initializers, _iconButtons_extraInitializers);
            __esDecorate(this, null, _linkedDocElement_decorators, { kind: "accessor", name: "linkedDocElement", static: false, private: false, access: { has: obj => "linkedDocElement" in obj, get: obj => obj.linkedDocElement, set: (obj, value) => { obj.linkedDocElement = value; } }, metadata: _metadata }, _linkedDocElement_initializers, _linkedDocElement_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LinkedDocPopover = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = linkedDocPopoverStyles; }
        get _actionGroup() {
            return this._linkedDocGroup.map(group => {
                return {
                    ...group,
                    items: this._getActionItems(group),
                };
            });
        }
        get _flattenActionList() {
            return this._actionGroup.flatMap(group => group.items.map(item => ({ ...item, groupName: group.name })));
        }
        get _query() {
            return getTextContentFromInlineRange(this.context.inlineEditor, this.context.startRange);
        }
        _getActionItems(group) {
            const isExpanded = !!this._expanded.get(group.name);
            let items = resolveSignal(group.items);
            const isOverflow = !!group.maxDisplay && items.length > group.maxDisplay;
            items = isExpanded ? items : items.slice(0, group.maxDisplay);
            if (isOverflow && !isExpanded && group.maxDisplay) {
                items = items.concat({
                    key: `${group.name} More`,
                    name: resolveSignal(group.overflowText) || 'more',
                    icon: MoreHorizontalIcon({ width: '24px', height: '24px' }),
                    action: () => {
                        this._expanded.set(group.name, true);
                        this.requestUpdate();
                    },
                });
            }
            return items;
        }
        _isTextOverflowing(element) {
            return element.scrollWidth > element.clientWidth;
        }
        connectedCallback() {
            super.connectedCallback();
            // init
            this._updateLinkedDocGroup().catch(console.error);
            this._disposables.addFromEvent(this, 'pointerdown', e => {
                // Prevent input from losing focus
                e.preventDefault();
            });
            this._disposables.addFromEvent(this, 'mousedown', e => {
                // Prevent input from losing focus in electron
                e.preventDefault();
            });
            this._disposables.addFromEvent(window, 'pointerdown', e => {
                if (e.target === this)
                    return;
                // We don't clear the query when clicking outside the popover
                this.context.close();
            });
            const keydownObserverAbortController = new AbortController();
            this._disposables.add(() => keydownObserverAbortController.abort());
            const { eventSource } = this.context.inlineEditor;
            if (!eventSource)
                return;
            createKeydownObserver({
                target: eventSource,
                signal: keydownObserverAbortController.signal,
                interceptor: (event, next) => {
                    if (event.key === 'GroupNext' || event.key === 'GroupPrevious') {
                        event.stopPropagation();
                        return;
                    }
                    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                    if (event.key === 'Escape') {
                        this.context.close();
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                    next();
                },
                onInput: isComposition => {
                    if (isComposition) {
                        this._updateLinkedDocGroup().catch(console.error);
                    }
                    else {
                        const subscription = this.context.inlineEditor.slots.renderComplete.subscribe(() => {
                            subscription.unsubscribe();
                            this._updateLinkedDocGroup().catch(console.error);
                        });
                    }
                },
                onPaste: () => {
                    setTimeout(() => {
                        this._updateLinkedDocGroup().catch(console.error);
                    }, 50);
                },
                onDelete: () => {
                    const curRange = this.context.inlineEditor.getInlineRange();
                    if (!this.context.startRange || !curRange) {
                        return;
                    }
                    if (curRange.index < this.context.startRange.index) {
                        this.context.close();
                    }
                    const subscription = this.context.inlineEditor.slots.renderComplete.subscribe(() => {
                        subscription.unsubscribe();
                        this._updateLinkedDocGroup().catch(console.error);
                    });
                },
                onMove: step => {
                    const itemLen = this._flattenActionList.length;
                    const nextIndex = (itemLen + this._activatedItemIndex + step) % itemLen;
                    const item = this._flattenActionList[nextIndex];
                    if (item) {
                        this._activatedItemKey = item.key;
                    }
                    this.scrollToFocusedItem();
                },
                onConfirm: () => {
                    this._flattenActionList[this._activatedItemIndex]
                        .action()
                        ?.catch(console.error);
                },
                onAbort: () => {
                    this.context.close();
                },
            });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._menusItemsEffectCleanup();
            this._updateLinkedDocGroupAbortController?.abort();
        }
        render() {
            const MAX_HEIGHT = 390;
            const style = this._position
                ? styleMap({
                    transform: `translate(${this._position.x}, ${this._position.y})`,
                    maxHeight: `${Math.min(this._position.height, MAX_HEIGHT)}px`,
                })
                : styleMap({
                    visibility: 'hidden',
                });
            const actionGroups = this._actionGroup.map(group => {
                // Check if the group is loading or hidden
                const isLoading = resolveSignal(group.loading);
                const isHidden = resolveSignal(group.hidden);
                return {
                    ...group,
                    isLoading,
                    isHidden,
                };
            });
            return html `<div class="linked-doc-popover" style="${style}">
      ${actionGroups
                .filter(group => (group.items.length > 0 || group.isLoading) && !group.isHidden)
                .map((group, idx) => {
                return html `
            <div class="divider" ?hidden=${idx === 0}></div>
            <div class="group-title">
              <div class="group-title-text">${group.name}</div>
              ${group.isLoading
                    ? html `<span class="loading-icon">${LoadingIcon()}</span>`
                    : nothing}
            </div>
            <div class="group" style=${group.styles ?? ''}>
              ${group.items.map(({ key, name, icon, action }) => {
                    const tooltip = this._showTooltip
                        ? html `<affine-tooltip
                      tip-position=${'right'}
                      .tooltipStyle=${css `
                        * {
                          color: ${unsafeCSSVar('white')} !important;
                        }
                      `}
                      >${name}</affine-tooltip
                    >`
                        : nothing;
                    return html `<icon-button
                  width="260px"
                  height="30px"
                  data-id=${key}
                  .text=${name}
                  hover=${this._activatedItemKey === key}
                  @pointerdown=${(e) => {
                        // Prevent event listeners being registered on the root document
                        // eg., radix-ui dialogs usePointerDownOutside hooks
                        e.stopPropagation();
                    }}
                  @click=${() => {
                        action()?.catch(console.error);
                    }}
                  @mousemove=${() => {
                        // Use `mousemove` instead of `mouseover` to avoid navigate conflict with keyboard
                        this._activatedItemKey = key;
                        // show tooltip whether text length overflows
                        for (const button of this.iconButtons.values()) {
                            if (button.dataset.id == key && button.textElement) {
                                const isOverflowing = this._isTextOverflowing(button.textElement);
                                this._showTooltip = isOverflowing;
                                break;
                            }
                        }
                    }}
                >
                  ${icon} ${tooltip}
                </icon-button>`;
                })}
            </div>
          `;
            })}
    </div>`;
        }
        willUpdate() {
            if (!this.hasUpdated) {
                const updatePosition = throttle(() => {
                    this._position = getPopperPosition({
                        getBoundingClientRect: () => {
                            return {
                                ...this.getBoundingClientRect(),
                                // Workaround: the width of the popover is zero when it is not rendered
                                width: 280,
                            };
                        },
                    }, this.context.startNativeRange);
                }, 10);
                this.disposables.addFromEvent(window, 'resize', updatePosition);
                const scrollContainer = getViewportElement(this.context.std.host);
                if (scrollContainer) {
                    // Note: in edgeless mode, the scroll container is not exist!
                    this.disposables.addFromEvent(scrollContainer, 'scroll', updatePosition, {
                        passive: true,
                    });
                }
                const gfx = this.context.std.get(GfxControllerIdentifier);
                this.disposables.add(gfx.viewport.viewportUpdated.subscribe(updatePosition));
                updatePosition();
            }
        }
        scrollToFocusedItem() {
            const shadowRoot = this.shadowRoot;
            if (!shadowRoot) {
                return;
            }
            // If there's no active item key, don't try to scroll
            if (!this._activatedItemKey) {
                return;
            }
            const ele = shadowRoot.querySelector(`icon-button[data-id=${CSS.escape(this._activatedItemKey)}]`);
            // If the element doesn't exist, don't log a warning
            if (!ele) {
                return;
            }
            ele.scrollIntoView({
                block: 'nearest',
            });
        }
        get _activatedItemIndex() {
            const index = this._flattenActionList.findIndex(item => item.key === this._activatedItemKey);
            return index === -1 ? 0 : index;
        }
        #_activatedItemKey_accessor_storage;
        get _activatedItemKey() { return this.#_activatedItemKey_accessor_storage; }
        set _activatedItemKey(value) { this.#_activatedItemKey_accessor_storage = value; }
        #_linkedDocGroup_accessor_storage;
        get _linkedDocGroup() { return this.#_linkedDocGroup_accessor_storage; }
        set _linkedDocGroup(value) { this.#_linkedDocGroup_accessor_storage = value; }
        #_position_accessor_storage;
        get _position() { return this.#_position_accessor_storage; }
        set _position(value) { this.#_position_accessor_storage = value; }
        #_showTooltip_accessor_storage;
        get _showTooltip() { return this.#_showTooltip_accessor_storage; }
        set _showTooltip(value) { this.#_showTooltip_accessor_storage = value; }
        #context_accessor_storage;
        get context() { return this.#context_accessor_storage; }
        set context(value) { this.#context_accessor_storage = value; }
        #iconButtons_accessor_storage;
        get iconButtons() { return this.#iconButtons_accessor_storage; }
        set iconButtons(value) { this.#iconButtons_accessor_storage = value; }
        #linkedDocElement_accessor_storage;
        get linkedDocElement() { return this.#linkedDocElement_accessor_storage; }
        set linkedDocElement(value) { this.#linkedDocElement_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._abort = () => {
                // remove popover dom
                this.context.close();
                // clear input query
                cleanSpecifiedTail(this.context.std, this.context.inlineEditor, this.context.triggerKey + (this._query || ''));
            };
            this._expanded = new Map();
            this._menusItemsEffectCleanup = () => { };
            this._updateLinkedDocGroup = async () => {
                const query = this._query;
                if (this._updateLinkedDocGroupAbortController) {
                    this._updateLinkedDocGroupAbortController.abort();
                }
                this._updateLinkedDocGroupAbortController = new AbortController();
                if (query === null || query.startsWith(' ')) {
                    this.context.close();
                    return;
                }
                this._linkedDocGroup = await this.context.config.getMenus(query, this._abort, this.context.std.host, this.context.inlineEditor, this._updateLinkedDocGroupAbortController.signal);
                this._menusItemsEffectCleanup();
                // need to rebind the effect because this._linkedDocGroup has changed.
                this._menusItemsEffectCleanup = effect(() => {
                    this._updateAutoFocusedItem();
                    // wait for the next tick to ensure the items are rendered to DOM
                    setTimeout(() => {
                        this.scrollToFocusedItem();
                    });
                });
            };
            this._updateAutoFocusedItem = () => {
                // Get the auto-focused item key from the config
                const autoFocusedItemKey = this.context.config.autoFocusedItemKey?.(this._linkedDocGroup, this._query || '', this._activatedItemKey, this.context.std.host, this.context.inlineEditor);
                if (autoFocusedItemKey) {
                    this._activatedItemKey = autoFocusedItemKey;
                    return;
                }
                // If no auto-focused item key is returned from the config and no item is currently focused,
                // focus the first item in the flattened action list
                if (!this._activatedItemKey && this._flattenActionList.length > 0) {
                    this._activatedItemKey = this._flattenActionList[0].key;
                }
            };
            this._updateLinkedDocGroupAbortController = null;
            this.#_activatedItemKey_accessor_storage = __runInitializers(this, __activatedItemKey_initializers, null);
            this.#_linkedDocGroup_accessor_storage = (__runInitializers(this, __activatedItemKey_extraInitializers), __runInitializers(this, __linkedDocGroup_initializers, []));
            this.#_position_accessor_storage = (__runInitializers(this, __linkedDocGroup_extraInitializers), __runInitializers(this, __position_initializers, null));
            this.#_showTooltip_accessor_storage = (__runInitializers(this, __position_extraInitializers), __runInitializers(this, __showTooltip_initializers, false));
            this.#context_accessor_storage = (__runInitializers(this, __showTooltip_extraInitializers), __runInitializers(this, _context_initializers, void 0));
            this.#iconButtons_accessor_storage = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _iconButtons_initializers, void 0));
            this.#linkedDocElement_accessor_storage = (__runInitializers(this, _iconButtons_extraInitializers), __runInitializers(this, _linkedDocElement_initializers, null));
            __runInitializers(this, _linkedDocElement_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return LinkedDocPopover = _classThis;
})();
export { LinkedDocPopover };
