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
import { dropdownSubMenuMiddleware, menu, } from '@blocksuite/affine-components/context-menu';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { DeleteIcon, InvisibleIcon, ViewIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { canGroupable } from '../../view-presets/kanban/group-by-utils.js';
import { KanbanSingleView } from '../../view-presets/kanban/kanban-view-manager.js';
import { TableSingleView } from '../../view-presets/table/table-view-manager.js';
import { dataViewCssVariable } from '../common/css-variable.js';
import { renderUniLit } from '../utils/uni-component/uni-component.js';
import { dragHandler } from '../utils/wc-dnd/dnd-context.js';
import { defaultActivators } from '../utils/wc-dnd/sensors/index.js';
import { createSortContext, sortable, } from '../utils/wc-dnd/sort/sort-context.js';
import { verticalListSortingStrategy } from '../utils/wc-dnd/sort/strategies/index.js';
import { getGroupByService } from './matcher.js';
const dateModeLabel = (key) => {
    switch (key) {
        case 'date-relative':
            return 'Relative';
        case 'date-day':
            return 'Day';
        case 'date-week-mon':
        case 'date-week-sun':
            return 'Week';
        case 'date-month':
            return 'Month';
        case 'date-year':
            return 'Year';
        default:
            return '';
    }
};
let GroupSetting = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _groupTrait_decorators;
    let _groupTrait_initializers = [];
    let _groupTrait_extraInitializers = [];
    let _groupContainer_decorators;
    let _groupContainer_initializers = [];
    let _groupContainer_extraInitializers = [];
    return class GroupSetting extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _groupTrait_decorators = [property({ attribute: false })];
            _groupContainer_decorators = [query('.group-sort-setting')];
            __esDecorate(this, null, _groupTrait_decorators, { kind: "accessor", name: "groupTrait", static: false, private: false, access: { has: obj => "groupTrait" in obj, get: obj => obj.groupTrait, set: (obj, value) => { obj.groupTrait = value; } }, metadata: _metadata }, _groupTrait_initializers, _groupTrait_extraInitializers);
            __esDecorate(this, null, _groupContainer_decorators, { kind: "accessor", name: "groupContainer", static: false, private: false, access: { has: obj => "groupContainer" in obj, get: obj => obj.groupContainer, set: (obj, value) => { obj.groupContainer = value; } }, metadata: _metadata }, _groupContainer_initializers, _groupContainer_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    data-view-group-setting {
      display: flex;
      flex-direction: column;
      gap: 4px;
      ${unsafeCSS(dataViewCssVariable())};
    }

    .group-sort-setting {
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 1;
      max-height: 200px;
      overflow: hidden auto;
      margin-right: 0;
      margin-bottom: 0;
    }

    /* WebKit-based browser scrollbar styling */
    .group-sort-setting::-webkit-scrollbar {
      width: 8px;
    }

    .group-sort-setting::-webkit-scrollbar-thumb {
      background-color: #b0b0b0; /* Grey slider */
      border-radius: 4px;
    }

    .group-sort-setting::-webkit-scrollbar-track {
      background: transparent;
    }

    .group-sort-setting {
      scrollbar-width: thin;
      scrollbar-color: #b0b0b0 transparent;
    }
    .group-hidden {
      opacity: 0.5;
    }
    .group-item {
      display: flex;
      padding: 4px 12px;
      position: relative;
      cursor: grab;
    }
    .group-item-drag-bar {
      width: 4px;
      height: 12px;
      border-radius: 1px;
      background-color: #efeff0;
      position: absolute;
      left: 4px;
      top: 0;
      bottom: 0;
      margin: auto;
    }
    .group-item:hover .group-item-drag-bar {
      background-color: #c0bfc1;
    }
    .group-item-op-icon {
      display: flex;
      align-items: center;
      border-radius: 4px;
    }
    .group-item-op-icon:hover {
      background-color: var(--affine-hover-color);
    }
    .group-item-op-icon svg {
      fill: var(--affine-icon-color);
      color: var(--affine-icon-color);
      width: 20px;
      height: 20px;
    }

    .group-item-name {
      font-size: 14px;
      line-height: 22px;
      flex: 1;
    }

    .properties-group-op {
      padding: 4px 8px;
      font-size: 12px;
      line-height: 20px;
      font-weight: 500;
      border-radius: 4px;
      cursor: pointer;
      color: ${unsafeCSS(cssVarV2.button.primary)};
    }

    .properties-group-op:hover {
      background-color: var(--affine-hover-color);
    }
  `; }
        #groupTrait_accessor_storage;
        get groupTrait() { return this.#groupTrait_accessor_storage; }
        set groupTrait(value) { this.#groupTrait_accessor_storage = value; }
        connectedCallback() {
            super.connectedCallback();
            this._disposables.addFromEvent(this, 'pointerdown', e => e.stopPropagation());
        }
        render() {
            const groups = this.groupTrait.groupsDataListAll$.value;
            if (!groups)
                return;
            const map = this.groupTrait.groupDataMap$.value;
            const isAllShowed = map
                ? Object.keys(map).every(k => !this.groupTrait.isGroupHidden(k))
                : true;
            const clickChangeAll = () => {
                if (!map)
                    return;
                Object.keys(map).forEach(key => {
                    this.groupTrait.setGroupHide(key, isAllShowed);
                });
            };
            return html `
      <div
        style="padding:7px 0;display:flex;justify-content:space-between;align-items:center;"
      >
        <div
          style="padding:0 4px;font-size:12px;color:var(--affine-text-secondary-color);line-height:20px;"
        >
          Groups
        </div>
        <div class="properties-group-op" @click="${clickChangeAll}">
          ${isAllShowed ? 'Hide All' : 'Show All'}
        </div>
      </div>

      <div class="group-sort-setting">
        ${repeat(groups, g => g?.key ?? 'k', g => {
                if (!g)
                    return;
                const type = g.property.dataType$.value;
                if (!type)
                    return;
                const props = { group: g, readonly: true };
                const icon = g.hide$.value ? InvisibleIcon() : ViewIcon();
                return html `
              <div
                ${sortable(g.key)}
                ${dragHandler(g.key)}
                class="dv-hover dv-round-4 group-item ${g.hide$.value
                    ? 'group-hidden'
                    : ''}"
              >
                <div class="group-item-drag-bar"></div>
                <div
                  class="group-item-name"
                  style="padding:0 4px;position:relative;pointer-events:none;max-width:330px;"
                >
                  ${renderUniLit(g.view, props)}
                  <div
                    style="position:absolute;left:0;top:0;right:0;bottom:0;"
                  ></div>
                </div>
                <div
                  class="group-item-op-icon"
                  @click="${() => g.hideSet(!g.hide$.value)}"
                >
                  ${icon}
                </div>
              </div>
            `;
            })}
      </div>
    `;
        }
        #groupContainer_accessor_storage;
        get groupContainer() { return this.#groupContainer_accessor_storage; }
        set groupContainer(value) { this.#groupContainer_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.#groupTrait_accessor_storage = __runInitializers(this, _groupTrait_initializers, void 0);
            this.groups$ = (__runInitializers(this, _groupTrait_extraInitializers), computed(() => this.groupTrait.groupsDataListAll$.value));
            this.sortContext = createSortContext({
                activators: defaultActivators,
                container: this,
                onDragEnd: evt => {
                    const over = evt.over;
                    const activeId = evt.active.id;
                    const groups = this.groups$.value;
                    if (over && over.id !== activeId && groups) {
                        const aIndex = groups.findIndex(g => g?.key === activeId);
                        const oIndex = groups.findIndex(g => g?.key === over.id);
                        this.groupTrait.moveGroupTo(activeId, aIndex > oIndex
                            ? { before: true, id: over.id }
                            : { before: false, id: over.id });
                    }
                },
                modifiers: [({ transform }) => ({ ...transform, x: 0 })],
                items: computed(() => this.groupTrait.groupsDataListAll$.value?.map(v => v?.key ?? '') ?? []),
                strategy: verticalListSortingStrategy,
            });
            this.#groupContainer_accessor_storage = __runInitializers(this, _groupContainer_initializers, void 0);
            __runInitializers(this, _groupContainer_extraInitializers);
        }
    };
})();
export { GroupSetting };
export const buildGroupSelectItems = (group, onSelect) => {
    const view = group.view;
    return [
        menu.group({
            items: view.propertiesRaw$.value
                .filter(property => {
                if (property.type$.value === 'title') {
                    return false;
                }
                if (view instanceof KanbanSingleView) {
                    return canGroupable(view.manager.dataSource, property.id);
                }
                const dataType = property.dataType$.value;
                if (!dataType) {
                    return false;
                }
                const groupByService = getGroupByService(view.manager.dataSource);
                return !!groupByService?.matcher.match(dataType);
            })
                .map(property => menu.action({
                name: property.name$.value,
                isSelected: group.property$.value?.id === property.id,
                prefix: html `<uni-lit .uni="${property.icon}"></uni-lit>`,
                select: () => {
                    group.changeGroup(property.id);
                    onSelect(property.id);
                    return false;
                },
            })),
        }),
        menu.group({
            items: [
                menu.action({
                    prefix: DeleteIcon(),
                    hide: () => view instanceof KanbanSingleView || !group.property$.value,
                    class: { 'delete-item': true },
                    name: 'Remove Grouping',
                    select: () => {
                        group.changeGroup(undefined);
                        onSelect(undefined);
                        return false;
                    },
                }),
            ],
        }),
    ];
};
export const buildGroupSettingItems = (group, onGroupByClick, onGroupRemoved) => {
    const view = group.view;
    const gProp = group.property$.value;
    if (!gProp)
        return [];
    const type = gProp.type$.value;
    if (!type)
        return [];
    const icon = gProp.icon;
    return [
        menu.group({
            items: [
                menu.action({
                    name: 'Group By',
                    postfix: html `
            <div
              style="display:flex;align-items:center;gap:4px;font-size:14px;line-height:20px;color:var(--affine-text-secondary-color);margin-left:8px;"
              class="dv-icon-16"
            >
              ${renderUniLit(icon, {})} ${gProp.name$.value}
            </div>
          `,
                    select: () => {
                        onGroupByClick();
                        return false;
                    },
                }),
            ],
        }),
        ...(type === 'date'
            ? [
                menu.group({
                    items: [
                        menu.dynamic(() => [
                            menu.subMenu({
                                name: 'Date by',
                                openOnHover: false,
                                middleware: dropdownSubMenuMiddleware,
                                autoHeight: true,
                                postfix: html `
                    <div
                      style="display:flex;align-items:center;gap:4px;font-size:14px;line-height:20px;color:var(--affine-text-secondary-color);margin-left:30px;"
                    >
                      ${dateModeLabel(group.groupInfo$.value?.config.name)}
                    </div>
                  `,
                                options: {
                                    items: [
                                        menu.dynamic(() => [
                                            ['Relative', 'date-relative'],
                                            ['Day', 'date-day'],
                                            [
                                                'Week',
                                                group.groupInfo$.value?.config.name ===
                                                    'date-week-mon'
                                                    ? 'date-week-mon'
                                                    : 'date-week-sun',
                                            ],
                                            ['Month', 'date-month'],
                                            ['Year', 'date-year'],
                                        ].map(([label, key]) => menu.action({
                                            name: label,
                                            label: () => {
                                                const isSelected = group.groupInfo$.value?.config.name === key;
                                                return html `<span
                                  style="font-size:14px;color:${isSelected
                                                    ? 'var(--affine-text-emphasis-color)'
                                                    : 'var(--affine-text-secondary-color)'}"
                                  >${label}</span
                                >`;
                                            },
                                            isSelected: group.groupInfo$.value?.config.name === key,
                                            select: () => {
                                                group.changeGroupMode(key);
                                                return false;
                                            },
                                        }))),
                                    ],
                                },
                            }),
                        ]),
                    ],
                }),
                ...(group.groupInfo$.value?.config.name?.startsWith('date-week')
                    ? [
                        menu.group({
                            items: [
                                menu.dynamic(() => [
                                    menu.subMenu({
                                        name: 'Start week on',
                                        postfix: html `
                          <div
                            style="display:flex;align-items:center;gap:4px;font-size:14px;line-height:20px;color:var(--affine-text-secondary-color);margin-left:8px;"
                          >
                            ${group.groupInfo$.value?.config.name ===
                                            'date-week-mon'
                                            ? 'Monday'
                                            : 'Sunday'}
                          </div>
                        `,
                                        options: {
                                            items: [
                                                menu.dynamic(() => [
                                                    ['Monday', 'date-week-mon'],
                                                    ['Sunday', 'date-week-sun'],
                                                ].map(([label, key]) => menu.action({
                                                    name: label,
                                                    label: () => {
                                                        const isSelected = group.groupInfo$.value?.config.name ===
                                                            key;
                                                        return html `<span
                                      style="font-size:14px;color:${isSelected
                                                            ? 'var(--affine-text-emphasis-color)'
                                                            : 'var(--affine-text-secondary-color)'}"
                                      >${label}</span
                                    >`;
                                                    },
                                                    isSelected: group.groupInfo$.value?.config.name === key,
                                                    select: () => {
                                                        group.changeGroupMode(key);
                                                        return false;
                                                    },
                                                }))),
                                            ],
                                        },
                                    }),
                                ]),
                            ],
                        }),
                    ]
                    : []),
                menu.group({
                    items: [
                        menu.dynamic(() => [
                            menu.subMenu({
                                name: 'Sort',
                                openOnHover: false,
                                middleware: dropdownSubMenuMiddleware,
                                autoHeight: true,
                                postfix: html `
                    <div
                      style="display:flex;align-items:center;gap:4px;font-size:14px;line-height:20px;color:var(--affine-text-secondary-color);margin-left:8px;"
                    >
                      ${group.sortAsc$.value ? 'Oldest first' : 'Newest first'}
                    </div>
                  `,
                                options: {
                                    items: [
                                        menu.dynamic(() => [
                                            menu.action({
                                                name: 'Oldest first',
                                                label: () => {
                                                    const isSelected = group.sortAsc$.value;
                                                    return html `<span
                              style="font-size:14px;color:${isSelected
                                                        ? 'var(--affine-text-emphasis-color)'
                                                        : 'var(--affine-text-secondary-color)'}"
                              >Oldest first</span
                            >`;
                                                },
                                                isSelected: group.sortAsc$.value,
                                                select: () => {
                                                    group.setDateSortOrder(true);
                                                    return false;
                                                },
                                            }),
                                            menu.action({
                                                name: 'Newest first',
                                                label: () => {
                                                    const isSelected = !group.sortAsc$.value;
                                                    return html `<span
                              style="font-size:14px;color:${isSelected
                                                        ? 'var(--affine-text-emphasis-color)'
                                                        : 'var(--affine-text-secondary-color)'}"
                              >Newest first</span
                            >`;
                                                },
                                                isSelected: !group.sortAsc$.value,
                                                select: () => {
                                                    group.setDateSortOrder(false);
                                                    return false;
                                                },
                                            }),
                                        ]),
                                    ],
                                },
                            }),
                        ]),
                    ],
                }),
            ]
            : []),
        menu.group({
            items: [
                menu.dynamic(() => [
                    menu.action({
                        name: 'Hide empty groups',
                        isSelected: group.hideEmpty$.value,
                        select: () => {
                            group.setHideEmpty(!group.hideEmpty$.value);
                            return false;
                        },
                    }),
                ]),
            ],
        }),
        menu.group({
            items: [
                menuObj => html `
          <data-view-group-setting
            @mouseenter=${() => menuObj.closeSubMenu()}
            .groupTrait=${group}
            .columnId=${gProp.id}
          ></data-view-group-setting>
        `,
            ],
        }),
        menu.group({
            items: [
                menu.action({
                    name: 'Remove grouping',
                    prefix: DeleteIcon(),
                    class: { 'delete-item': true },
                    hide: () => !(view instanceof TableSingleView),
                    select: () => {
                        group.changeGroup(undefined);
                        onGroupRemoved?.();
                        return false;
                    },
                }),
            ],
        }),
    ];
};
