import { createIdentifier } from '@blocksuite/global/di';
export const CalendarExternalSourceProvider = createIdentifier('calendar-external-source');
export const getCalendarExternalSources = (dataSource, viewData) => Array.from(dataSource.provider.getAll(CalendarExternalSourceProvider).values()).map(source => source.create(viewData));
