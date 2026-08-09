import type { DataViewWidget, DataViewWidgetProps } from '../../core/widget/types.js';
export declare const toolsWidgetPresets: {
    sort: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
    filter: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
    search: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
    viewOptions: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
    tableAddRow: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
};
export declare const createWidgetTools: (toolsMap: Record<string, DataViewWidget[]>) => import("@blocksuite/affine-shared/types").UniComponent<DataViewWidgetProps, {}>;
//# sourceMappingURL=index.d.ts.map