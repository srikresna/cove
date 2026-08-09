import type { CalendarViewData } from './types.js';
export declare const calendarViewType: {
    type: "calendar";
    createModel: <Data extends import("../../index.js").DataViewDataType>(model: import("../../index.js").DataViewModelConfig<Data>) => import("../../index.js").DataViewModel<"calendar", Data> & {
        createMeta: (renderer: import("../../index.js").DataViewRendererConfig) => import("../../index.js").ViewMeta<"calendar", Data>;
    };
};
export declare const calendarViewModel: import("../../index.js").DataViewModel<"calendar", CalendarViewData> & {
    createMeta: (renderer: import("../../index.js").DataViewRendererConfig) => import("../../index.js").ViewMeta<"calendar", CalendarViewData>;
};
//# sourceMappingURL=define.d.ts.map