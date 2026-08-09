import { viewConverts, viewPresets } from '@blocksuite/data-view/view-presets';
export const databaseBlockViews = [
    viewPresets.tableViewMeta,
    viewPresets.kanbanViewMeta,
    viewPresets.calendarViewMeta,
];
export const databaseBlockViewMap = Object.fromEntries(databaseBlockViews.map(view => [view.type, view]));
export const databaseBlockViewConverts = [...viewConverts];
