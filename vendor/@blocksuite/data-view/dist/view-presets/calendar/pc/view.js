import { menu, popFilterableSimpleMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { ArrowLeftSmallIcon, ArrowRightSmallIcon, CloseIcon, DateTimeIcon, IntegrationsIcon, LinkedPageIcon, PlusIcon, TodayIcon, } from '@blocksuite/icons/lit';
import { html, nothing } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { createUniComponentFromWebComponent, renderUniLit, } from '../../../core/index.js';
import { DataViewUIBase, DataViewUILogicBase, } from '../../../core/view/data-view-base.js';
import { createCalendarMonthLayout, getCalendarDayContentSlots, getCalendarDaySegmentSlots, getCalendarVisibleMonthRange, } from '../layout.js';
import { openCalendarEntry } from './actions.js';
import { CalendarDnd } from './dnd.js';
import { getCalendarDateFromPoint } from './hit-test.js';
import { calendarViewStyles } from './styles.js';
const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
});
const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});
const startOfDay = (time) => {
    const date = time instanceof Date ? time : new Date(time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};
const getDefaultCreateDate = (month) => {
    const today = startOfDay(Date.now());
    const monthDate = new Date(month);
    const todayDate = new Date(today);
    if (monthDate.getFullYear() === todayDate.getFullYear() &&
        monthDate.getMonth() === todayDate.getMonth()) {
        return today;
    }
    return new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getTime();
};
export class CalendarViewUILogic extends DataViewUILogicBase {
    constructor() {
        super(...arguments);
        this.dnd = new CalendarDnd(this.root.config.dnd, {
            getEntry: entryId => this.view.entries$.value.find(entry => entry.id === entryId),
            canDragEntry: () => !this.view.readonly$.value,
            canDrop: entity => this.canDropDndEntity(entity),
            onEntryDragStart: entry => {
                this.interactionState = { type: 'drag', entry };
                this.ui?.requestUpdate();
            },
            onEntryDragEnd: () => {
                this.endInteraction();
            },
            onDropTargetChange: (day, entity) => {
                this.setInteractionTarget(day, entity);
            },
            onDrop: (entity, date) => {
                this.dropDndEntity(entity, date);
            },
        });
        this.suppressNextClick = false;
        this.currentMonth = startOfDay(Date.now());
        this.clearSelection = () => {
            this.setSelection(undefined);
        };
        this.addRow = (position) => {
            if (this.view.readonly$.value)
                return;
            const rowId = this.view.rowAdd(position);
            if (rowId) {
                this.root.openDetailPanel({
                    view: this.view,
                    rowId,
                });
            }
            return rowId;
        };
        this.focusFirstCell = () => { };
        this.onWheel = (event) => {
            if (event.metaKey || event.ctrlKey) {
                return;
            }
            const ele = event.currentTarget;
            if (ele instanceof HTMLElement) {
                if (ele.scrollWidth === ele.clientWidth) {
                    return;
                }
                event.stopPropagation();
            }
        };
        this.showIndicator = () => false;
        this.hideIndicator = () => { };
        this.moveTo = () => { };
        this.renderer = createUniComponentFromWebComponent(CalendarViewUI);
    }
    getPreviewRange() {
        const state = this.interactionState;
        const target = state?.targetDay;
        if (!state || target === undefined)
            return undefined;
        if (state.type === 'doc') {
            return { start: target, end: target };
        }
        if (state.type === 'drag') {
            const entry = state.entry;
            const duration = entry.endAt !== undefined ? entry.endAt - entry.startAt : 0;
            return { start: target, end: startOfDay(target + duration) };
        }
        const entry = state.entry;
        const entryStart = startOfDay(entry.startAt);
        const entryEnd = entry.endAt !== undefined ? startOfDay(entry.endAt) : entryStart;
        if (state.edge === 'start') {
            return {
                start: Math.min(target, entryEnd),
                end: Math.max(target, entryEnd),
            };
        }
        return {
            start: Math.min(entryStart, target),
            end: Math.max(entryStart, target),
        };
    }
    isDayInPreview(day) {
        const range = this.getPreviewRange();
        if (!range)
            return false;
        return day >= range.start && day <= range.end;
    }
    isEntryBeingMoved(entryId) {
        const state = this.interactionState;
        return (state !== undefined && state.type !== 'doc' && state.entry.id === entryId);
    }
    attach(ui) {
        this.ui = ui;
        this.loadExternalEntries();
    }
    detach(ui) {
        if (this.ui !== ui)
            return;
        this.cleanupResizeInteraction();
        this.dnd.cleanup();
        this.endInteraction();
        this.ui = undefined;
    }
    moveMonth(offset) {
        const date = new Date(this.currentMonth);
        this.currentMonth = startOfDay(new Date(date.getFullYear(), date.getMonth() + offset, 1));
        this.ui?.requestUpdate();
        this.loadExternalEntries();
    }
    goToday() {
        this.currentMonth = startOfDay(Date.now());
        this.ui?.requestUpdate();
        this.loadExternalEntries();
    }
    isCurrentMonth() {
        const cursor = new Date(this.currentMonth);
        const today = new Date();
        return (cursor.getFullYear() === today.getFullYear() &&
            cursor.getMonth() === today.getMonth());
    }
    createRowOnDate(date) {
        if (this.view.readonly$.value)
            return;
        const rowId = this.view.createRowOnDate(date);
        if (rowId) {
            this.root.openDetailPanel({
                view: this.view,
                rowId,
            });
        }
    }
    openSetupMenu(target) {
        const items = this.view.dateProperties$.value.map(property => menu.action({
            name: property.name$.value || 'Date',
            select: () => {
                this.view.setDateColumn(property.id);
            },
        }));
        if (!this.view.readonly$.value) {
            items.push(menu.action({
                name: 'Create date property',
                select: () => {
                    this.view.createDateColumn();
                },
            }));
        }
        popFilterableSimpleMenu(popupTargetFromElement(target), items);
    }
    getWorkspaceCalendarConfig() {
        return (this.view.data$.value?.sources.workspaceCalendar ?? {
            enabled: true,
        });
    }
    createSourceControlItems() {
        const workspaceCalendar = this.getWorkspaceCalendarConfig();
        const selectedIds = workspaceCalendar.subscriptionIds
            ? new Set(workspaceCalendar.subscriptionIds)
            : undefined;
        const hasSubscriptionOptions = this.view.externalSources$.value.some(source => (source.getSubscriptionOptions?.().length ?? 0) > 0);
        const subscriptionItems = this.view.externalSources$.value.flatMap(source => source.getSubscriptionOptions?.().map(subscription => menu.action({
            name: `${selectedIds && !selectedIds.has(subscription.id) ? 'Show' : 'Hide'} ${subscription.name}`,
            closeOnSelect: false,
            select: () => {
                const allIds = source
                    .getSubscriptionOptions?.()
                    .map(subscription => subscription.id);
                if (!allIds?.length) {
                    return;
                }
                const next = new Set(selectedIds ?? allIds);
                if (next.has(subscription.id)) {
                    next.delete(subscription.id);
                }
                else {
                    next.add(subscription.id);
                }
                this.view.setWorkspaceCalendarSubscriptionIds([...next]);
                this.loadExternalEntries();
            },
        })) ?? []);
        const connectItems = this.view.externalSources$.value.flatMap(source => source.openConnectSettings
            ? [
                menu.action({
                    name: 'Connect calendar',
                    closeOnSelect: false,
                    select: () => {
                        source.openConnectSettings?.();
                    },
                }),
            ]
            : []);
        const toggleItems = hasSubscriptionOptions
            ? [
                menu.action({
                    name: workspaceCalendar.enabled
                        ? 'Hide workspace calendar'
                        : 'Show workspace calendar',
                    closeOnSelect: false,
                    select: () => {
                        this.view.setWorkspaceCalendarEnabled(!workspaceCalendar.enabled);
                        this.loadExternalEntries();
                    },
                }),
                menu.action({
                    name: 'Show all workspace calendars',
                    closeOnSelect: false,
                    select: () => {
                        this.view.setWorkspaceCalendarSubscriptionIds(undefined);
                        this.loadExternalEntries();
                    },
                }),
            ]
            : [];
        return [...toggleItems, ...subscriptionItems, ...connectItems];
    }
    openSourceMenu(target) {
        popFilterableSimpleMenu(popupTargetFromElement(target), this.createSourceControlItems());
    }
    getDatePropertyMenuItems(selectedPropertyId, onSelect, create, options) {
        const closeOnSelect = options?.closeOnSelect;
        const items = [];
        if (options?.includeNone) {
            items.push(menu.action({
                name: 'None',
                isSelected: !selectedPropertyId,
                closeOnSelect,
                select: () => onSelect(undefined),
            }));
        }
        items.push(...this.view.dateProperties$.value.map(property => menu.action({
            name: property.name$.value || 'Date',
            isSelected: property.id === selectedPropertyId,
            closeOnSelect,
            select: () => onSelect(property.id),
        })));
        if (!this.view.readonly$.value && create) {
            items.push(menu.action({
                name: options?.createLabel ?? 'Create date property',
                closeOnSelect,
                select: create,
            }));
        }
        return items;
    }
    getViewOptionsSettingItems(navigateToSubPage, goBack) {
        const selectedStart = this.view.startDateMapping$.value.propertyId;
        const selectedEnd = this.view.endDateMapping$.value.propertyId;
        return [
            menu.group({
                name: 'Date range',
                items: [
                    menu.action({
                        name: 'Calendar by',
                        prefix: TodayIcon(),
                        closeOnSelect: false,
                        postfix: html `<div
                style="font-size:14px;color:var(--affine-text-secondary-color);"
              >
                ${this.view.startDateMapping$.value.status === 'ready'
                            ? this.view.propertyGetOrCreate(selectedStart ?? '').name$
                                .value
                            : ''}
              </div>
              ${ArrowRightSmallIcon()}`,
                        select: () => {
                            navigateToSubPage('Calendar by', () => this.getDatePropertyMenuItems(this.view.startDateMapping$.value.propertyId, propertyId => {
                                if (propertyId) {
                                    this.view.setStartDateColumn(propertyId);
                                    goBack();
                                }
                            }, () => {
                                this.view.createStartDateColumn();
                                goBack();
                            }, { closeOnSelect: false }));
                        },
                    }),
                    menu.action({
                        name: 'End date',
                        prefix: DateTimeIcon(),
                        closeOnSelect: false,
                        postfix: html `<div
                style="font-size:14px;color:var(--affine-text-secondary-color);"
              >
                ${selectedEnd
                            ? this.view.propertyGetOrCreate(selectedEnd).name$.value
                            : 'None'}
              </div>
              ${ArrowRightSmallIcon()}`,
                        select: () => {
                            navigateToSubPage('End date', () => this.getDatePropertyMenuItems(this.view.endDateMapping$.value.propertyId, propertyId => {
                                this.view.setEndDateColumn(propertyId);
                                goBack();
                            }, () => {
                                this.view.createEndDateColumn();
                                goBack();
                            }, {
                                includeNone: true,
                                createLabel: 'Create end date property',
                                closeOnSelect: false,
                            }));
                        },
                    }),
                    menu.action({
                        name: 'External calendars',
                        prefix: IntegrationsIcon(),
                        closeOnSelect: false,
                        postfix: html `${ArrowRightSmallIcon()}`,
                        select: () => {
                            navigateToSubPage('External calendars', () => this.createSourceControlItems());
                        },
                    }),
                ],
            }),
        ];
    }
    openEntry(entry, target) {
        openCalendarEntry(this.root, this.view, entry, target, {
            selectEntry: entryId => {
                this.selectedEntryId = entryId;
                this.ui?.requestUpdate();
            },
        });
    }
    get isInteracting() {
        return this.interactionState !== undefined;
    }
    setInteractionTarget(day, entity) {
        if (day !== undefined && entity?.type === 'doc') {
            const current = this.interactionState;
            if (current?.type === 'doc' &&
                current.docId === entity.docId &&
                current.targetDay === day) {
                return;
            }
            this.interactionState = {
                type: 'doc',
                docId: entity.docId,
                targetDay: day,
            };
            this.ui?.requestUpdate();
            return;
        }
        if (this.interactionState?.type === 'doc') {
            this.interactionState = undefined;
            this.ui?.requestUpdate();
            return;
        }
        if (this.interactionState?.targetDay !== day) {
            if (this.interactionState) {
                this.interactionState = {
                    ...this.interactionState,
                    targetDay: day,
                };
            }
            this.ui?.requestUpdate();
        }
    }
    endInteraction() {
        this.interactionState = undefined;
        this.ui?.requestUpdate();
    }
    bindCalendarDropTarget(element) {
        this.dnd.bindRoot(element);
    }
    bindEntryDraggable(key, entry, element) {
        this.dnd.bindEntry(key, entry, element, this.view.readonly$.value);
    }
    canDropDndEntity(entity) {
        if (this.view.readonly$.value) {
            return false;
        }
        if (entity.type === 'calendar-entry') {
            const entry = this.view.entries$.value.find(entry => entry.id === entity.entryId);
            return entry?.kind === 'row';
        }
        if (entity.type === 'doc') {
            return this.view.startDateMapping$.value.status === 'ready';
        }
        return false;
    }
    dropDndEntity(entity, day) {
        try {
            if (entity.type === 'calendar-entry') {
                const entry = this.view.entries$.value.find(entry => entry.id === entity.entryId);
                if (entry?.kind === 'row') {
                    this.view.moveRowToDate(entry.rowId, day);
                }
            }
            if (entity.type === 'doc') {
                this.view.createLinkedDocRowOnDate(day, entity.docId);
            }
        }
        finally {
            this.endInteraction();
        }
    }
    startResize(entry, edge, event) {
        if (entry.kind !== 'row' || !entry.canResizeRange) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.cleanupResizeInteraction();
        this.interactionState = {
            type: 'resize',
            entry: entry,
            edge,
        };
        this.ui?.requestUpdate();
        const root = event.currentTarget.closest('.calendar-grid');
        const doc = event.currentTarget.ownerDocument;
        const dayFromPointer = (pointerEvent) => {
            if (!root) {
                return;
            }
            return getCalendarDateFromPoint(root, pointerEvent.clientX, pointerEvent.clientY);
        };
        const onPointerMove = (pointerEvent) => {
            this.setInteractionTarget(dayFromPointer(pointerEvent));
        };
        const onPointerUp = (pointerEvent) => {
            cleanup();
            const date = dayFromPointer(pointerEvent);
            if (date !== undefined) {
                this.view.resizeRowRange(entry.rowId, edge, date);
            }
            this.endInteraction();
            // Suppress the click event that the browser fires after pointerup
            // when the pointer is released on top of the entry element.
            this.suppressNextClick = true;
            requestAnimationFrame(() => {
                this.suppressNextClick = false;
            });
        };
        const cleanup = () => {
            doc.removeEventListener('pointermove', onPointerMove);
            doc.removeEventListener('pointerup', onPointerUp);
            if (this.cleanupResize === cleanup) {
                this.cleanupResize = undefined;
            }
        };
        this.cleanupResize = cleanup;
        doc.addEventListener('pointermove', onPointerMove);
        doc.addEventListener('pointerup', onPointerUp);
    }
    cleanupResizeInteraction() {
        this.cleanupResize?.();
        this.cleanupResize = undefined;
    }
    handleEntryClick(entry, target) {
        if (this.suppressNextClick) {
            return;
        }
        this.openEntry(entry, target);
    }
    handleEntryKeydown(entry, event) {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
        event.preventDefault();
        this.handleEntryClick(entry, event.currentTarget);
    }
    loadExternalEntries() {
        const range = getCalendarVisibleMonthRange(this.currentMonth);
        this.view
            .loadExternalEntries({ from: range.from, to: range.to })
            .catch(() => {
            this.root.config.notification.toast('Failed to load calendar entries');
        });
    }
}
export class CalendarViewUI extends DataViewUIBase {
    static { this.styles = calendarViewStyles; }
    connectedCallback() {
        super.connectedCallback();
        this.logic.attach(this);
        this.dataset['testid'] = 'dv-calendar-view';
    }
    disconnectedCallback() {
        this.logic.detach(this);
        super.disconnectedCallback();
    }
    renderEntry(entry, extraStyle = '', segment) {
        const dndKey = segment
            ? `${entry.id}:${segment.weekIndex}:${segment.startIndex}`
            : `${entry.id}:day`;
        const colorStyle = entry.kind === 'external' && entry.color
            ? `--calendar-external-color:${entry.color};`
            : '';
        const segmentClass = segment
            ? `${segment.startsBeforeWeek ? 'continues-left' : ''} ${segment.endsAfterWeek ? 'continues-right' : ''}`
            : '';
        const canResize = entry.kind === 'row' && entry.canResizeRange;
        const showLeftHandle = canResize && segment && !segment.startsBeforeWeek;
        const showRightHandle = canResize && segment && !segment.endsAfterWeek;
        return html `
      <div
        ${ref(element => this.logic.bindEntryDraggable(dndKey, entry, element))}
        class="calendar-entry ${entry.kind} ${segmentClass} ${this.logic
            .selectedEntryId === entry.id
            ? 'selected'
            : ''}"
        role="button"
        tabindex="0"
        aria-label=${entry.title || 'Untitled'}
        style=${`${colorStyle}${extraStyle}`}
        @click=${(event) => {
            this.logic.handleEntryClick(entry, event.currentTarget);
        }}
        @keydown=${(event) => {
            this.logic.handleEntryKeydown(entry, event);
        }}
      >
        ${showLeftHandle
            ? html `<span
              class="calendar-resize-handle left"
              @pointerdown=${(event) => this.logic.startResize(entry, 'start', event)}
            ></span>`
            : nothing}
        ${this.renderEntryTitle(entry)}
        ${entry.kind === 'row' && entry.cardProperties.length
            ? html `<span class="calendar-entry-properties">
              ${entry.cardProperties.map(property => html `<span class="calendar-entry-property"
                    >${property.value}</span
                  >`)}
            </span>`
            : nothing}
        ${showRightHandle
            ? html `<span
              class="calendar-resize-handle right"
              @pointerdown=${(event) => this.logic.startResize(entry, 'end', event)}
            ></span>`
            : nothing}
      </div>
    `;
    }
    renderEntryTitle(entry) {
        if (entry.kind !== 'row') {
            return html `<span
        class="calendar-entry-title ${entry.title ? '' : 'is-empty'}"
        >${entry.title || 'Untitled'}</span
      >`;
        }
        if (entry.titleSegments?.length) {
            return html `<span class="calendar-entry-title title-segments">
        ${entry.titleSegments.map(segment => html `<span
              class="calendar-entry-title-segment ${segment.linkedDoc
                ? 'linked-doc-segment'
                : ''}"
            >
              ${segment.linkedDoc ? LinkedPageIcon() : nothing}
              ${segment.text
                ? html `<span class="calendar-entry-title-text"
                    >${segment.text}</span
                  >`
                : nothing}
            </span>`)}
      </span>`;
        }
        return html `<span
      class="calendar-entry-title ${entry.title ? '' : 'is-empty'}"
      >${entry.title || 'Untitled'}</span
    >`;
    }
    getMovingEntryId() {
        const state = this.logic.interactionState;
        return state?.type !== 'doc' ? state?.entry.id : undefined;
    }
    renderDayPreview(dayDate) {
        const range = this.logic.getPreviewRange();
        if (!range || range.start !== range.end)
            return nothing;
        if (dayDate !== range.start)
            return nothing;
        const state = this.logic.interactionState;
        if (!state)
            return nothing;
        if (state.type === 'doc') {
            return html `<div class="calendar-entry-preview doc">
        ${LinkedPageIcon()}
        <span class="calendar-entry-title-text"
          >${this.logic.view.getDocDisplayTitle(state.docId)}</span
        >
      </div>`;
        }
        const title = state.entry.title || 'Untitled';
        return html `<div class="calendar-entry-preview">${title}</div>`;
    }
    getSegmentPreviewLayout(week) {
        const range = this.logic.getPreviewRange();
        if (!range || range.start === range.end)
            return;
        const state = this.logic.interactionState;
        if (!state || state.type === 'doc')
            return;
        const weekStart = week[0]?.date;
        const weekEnd = week[6]?.date;
        if (weekStart === undefined || weekEnd === undefined)
            return;
        if (range.start > weekEnd || range.end < weekStart)
            return;
        const segStart = Math.max(range.start, weekStart);
        const segEnd = Math.min(range.end, weekEnd);
        const sIdx = week.findIndex(d => d.date === segStart);
        const eIdx = week.findIndex(d => d.date === segEnd);
        if (sIdx < 0 || eIdx < 0)
            return;
        const slot = Math.max(0, ...week
            .slice(sIdx, eIdx + 1)
            .map(day => getCalendarDayContentSlots(day, state.entry.id)));
        return {
            sIdx,
            eIdx,
            span: eIdx - sIdx + 1,
            slot,
            continuesLeft: range.start < weekStart,
            continuesRight: range.end > weekEnd,
            title: range.start < weekStart ? '' : state.entry.title || 'Untitled',
        };
    }
    renderPreviewSpacer(day, preview, dayIndex) {
        const movingEntryId = this.getMovingEntryId();
        if (!preview || dayIndex < preview.sIdx || dayIndex > preview.eIdx) {
            return nothing;
        }
        const spacerSlots = preview.slot + 1 - getCalendarDayContentSlots(day, movingEntryId);
        if (spacerSlots <= 0) {
            return nothing;
        }
        return html `<div
      class="calendar-preview-spacer"
      style="height:calc(${spacerSlots} * var(--calendar-entry-slot-height));"
    ></div>`;
    }
    renderSegmentPreview(preview) {
        if (!preview)
            return nothing;
        return html `<div
      class="calendar-entry-preview ${preview.continuesLeft
            ? 'continues-left'
            : ''} ${preview.continuesRight ? 'continues-right' : ''}"
      style="grid-column:${preview.sIdx +
            1} / span ${preview.span};grid-row:${preview.slot + 1};"
    >
      ${preview.title}
    </div>`;
    }
    renderEmptyMonthHint(showHint) {
        if (!showHint) {
            return nothing;
        }
        return html `<div class="calendar-empty-month-hint">
      <div class="calendar-empty-month-hint-copy">
        <span class="calendar-empty-month-hint-title">Nothing here yet</span>
        <span class="calendar-empty-month-hint-body">
          Add a row to any date, it'll appear here on the calendar.
        </span>
      </div>
      <div class="calendar-empty-month-hint-actions">
        ${this.logic.view.readonly$.value
            ? nothing
            : html `<button
              class="calendar-empty-month-hint-action"
              @click=${() => this.logic.createRowOnDate(getDefaultCreateDate(this.logic.currentMonth))}
            >
              ${PlusIcon()}<span>New row</span>
            </button>`}
        <button
          class="calendar-empty-month-hint-close"
          aria-label="Dismiss"
          @click=${() => this.logic.view.dismissEmptyMonthHint()}
        >
          ${CloseIcon()}
        </button>
      </div>
    </div>`;
    }
    renderCalendar(skeleton = false) {
        const entries = skeleton ? [] : this.logic.view.entries$.value;
        const layout = createCalendarMonthLayout({
            month: this.logic.currentMonth,
            entries,
        });
        const weekdays = layout.weeks[0] ?? [];
        const today = startOfDay(Date.now());
        const currentMonthEmpty = layout.days
            .filter(day => day.inMonth)
            .every(day => day.entries.length === 0 && day.segments.length === 0);
        const showEmptyMonthHint = currentMonthEmpty &&
            !skeleton &&
            !this.logic.view.emptyMonthHintDismissed$.value;
        return html `
      <div class="calendar-shell">
        <div class="calendar-toolbar">
          <div class="calendar-title">
            ${monthFormatter.format(new Date(this.logic.currentMonth))}
          </div>
          <div class="calendar-nav">
            ${this.logic.isCurrentMonth()
            ? nothing
            : html `<button
                  class="calendar-today-button"
                  @click=${() => this.logic.goToday()}
                >
                  <span>Today</span>
                </button>`}
            <button
              class="calendar-icon-button"
              aria-label="Previous month"
              @click=${() => this.logic.moveMonth(-1)}
            >
              ${ArrowLeftSmallIcon()}
            </button>
            <button
              class="calendar-icon-button"
              aria-label="Next month"
              @click=${() => this.logic.moveMonth(1)}
            >
              ${ArrowRightSmallIcon()}
            </button>
          </div>
        </div>
        ${this.renderEmptyMonthHint(showEmptyMonthHint)}
        <div class="calendar-weekdays">
          ${repeat(weekdays, day => day.date, day => html `<div class="calendar-weekday">
                ${weekdayFormatter.format(new Date(day.date))}
              </div>`)}
        </div>
        <div
          ${ref(element => this.logic.bindCalendarDropTarget(element))}
          class="calendar-grid"
        >
          ${repeat(layout.weeks, week => week[0]?.date ?? 0, week => {
            const weekSegments = layout.segments.filter(segment => segment.weekIndex === layout.weeks.indexOf(week));
            const preview = this.getSegmentPreviewLayout(week);
            const movingEntryId = this.getMovingEntryId();
            return html `
                <div class="calendar-week">
                  ${repeat(week, day => day.date, (day, dayIndex) => {
                const canReserveNewRow = !this.logic.view.readonly$.value && day.inMonth;
                return html `
                        <div
                          data-date=${day.date}
                          class="calendar-day ${day.inMonth
                    ? ''
                    : 'is-outside'} ${day.date === today
                    ? 'is-today'
                    : ''} ${this.logic.isDayInPreview(day.date)
                    ? 'is-drop-target'
                    : ''}"
                          style="--calendar-segment-slots:${getCalendarDaySegmentSlots(day, movingEntryId)};"
                        >
                          <div class="calendar-day-number">
                            ${dateFormatter.format(new Date(day.date))}
                          </div>
                          <div class="calendar-day-entries">
                            ${day.entries
                    .filter(e => !this.logic.isEntryBeingMoved(e.id))
                    .map(entry => this.renderEntry(entry))}
                            ${this.renderDayPreview(day.date)}
                            ${this.renderPreviewSpacer(day, preview, dayIndex)}
                          </div>
                          ${canReserveNewRow
                    ? html `<button
                                class="calendar-new-row"
                                aria-label="+ New row"
                                ?disabled=${this.logic.isInteracting}
                                @click=${() => this.logic.createRowOnDate(day.date)}
                              >
                                ${PlusIcon()}<span>New row</span>
                              </button>`
                    : nothing}
                        </div>
                      `;
            })}
                  <div class="calendar-segments">
                    ${weekSegments
                .filter(s => !this.logic.isEntryBeingMoved(s.entry.id))
                .map(segment => this.renderEntry(segment.entry, `grid-column:${segment.startIndex + 1} / span ${segment.span};grid-row:${segment.slot + 1};`, segment))}
                    ${this.renderSegmentPreview(preview)}
                  </div>
                </div>
              `;
        })}
        </div>
      </div>
    `;
    }
    render() {
        const setup = this.logic.view.dateMapping$.value.status === 'setup';
        return html `
      ${this.logic.headerWidget
            ? renderUniLit(this.logic.headerWidget, {
                dataViewLogic: this.logic,
            })
            : nothing}
      <div class=${setup ? 'calendar-setup-wrap' : ''}>
        <div class="calendar-scroll" @wheel="${this.logic.onWheel}">
          ${this.renderCalendar(setup)}
        </div>
        ${setup
            ? html `<div class="calendar-setup">
              <button
                @click=${(event) => this.logic.openSetupMenu(event.currentTarget)}
              >
                ${TodayIcon()}<span>Select or create date property</span>
              </button>
            </div>`
            : nothing}
      </div>
    `;
    }
}
