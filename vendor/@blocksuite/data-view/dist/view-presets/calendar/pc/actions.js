import { popMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { CalendarPanelIcon, DateTimeIcon, PinIcon, TextIcon, } from '@blocksuite/icons/lit';
import { html } from 'lit';
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
});
export const formatEntryTime = (entry) => {
    const formatter = entry.allDay ? dateFormatter : dateTimeFormatter;
    const start = formatter.format(new Date(entry.startAt));
    if (!entry.endAt) {
        return start;
    }
    return `${start} - ${formatter.format(new Date(entry.endAt))}`;
};
export const openCalendarEntry = (root, view, entry, target, options) => {
    if (entry.kind === 'row') {
        options?.selectEntry?.(entry.id);
        root.openDetailPanel({
            view,
            rowId: entry.rowId,
            onClose: () => options?.selectEntry?.(undefined),
        });
        return;
    }
    popMenu(popupTargetFromElement(target), {
        options: {
            items: [
                () => html `
          <div class="calendar-event-popover">
            <div class="calendar-event-popover-title">${entry.title}</div>
            <div class="calendar-event-popover-row">
              <span class="calendar-event-popover-icon"
                >${CalendarPanelIcon()}</span
              >
              <span>${entry.calendarName ?? 'Calendar event'}</span>
            </div>
            <div class="calendar-event-popover-row">
              <span class="calendar-event-popover-icon">${DateTimeIcon()}</span>
              <span>${formatEntryTime(entry)}</span>
            </div>
            ${entry.location
                    ? html `<div class="calendar-event-popover-row">
                  <span class="calendar-event-popover-icon">${PinIcon()}</span>
                  <span>${entry.location}</span>
                </div>`
                    : ''}
            ${entry.description
                    ? html `<div class="calendar-event-popover-row">
                  <span class="calendar-event-popover-icon">${TextIcon()}</span>
                  <span class="calendar-event-popover-description"
                    >${entry.description}</span
                  >
                </div>`
                    : ''}
          </div>
        `,
            ],
        },
    });
};
