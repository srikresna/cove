import './pc/effect.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { calendarViewModel } from './define.js';
import { CalendarViewUILogic } from './pc/view.js';
export const calendarViewMeta = calendarViewModel.createMeta({
    icon: createIcon('TodayIcon'),
    pcLogic: () => CalendarViewUILogic,
});
