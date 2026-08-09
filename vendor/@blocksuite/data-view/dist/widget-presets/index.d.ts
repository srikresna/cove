export declare const widgetPresets: {
    viewBar: import("@blocksuite/affine-shared/types").UniComponent<import("../index.js").DataViewWidgetProps & {
        onChangeView?: (viewId: string) => void;
    }, {}>;
    quickSettingBar: import("@blocksuite/affine-shared/types").UniComponent<import("../index.js").DataViewWidgetProps, {}>;
    createTools: (toolsMap: Record<string, import("../index.js").DataViewWidget[]>) => import("@blocksuite/affine-shared/types").UniComponent<import("../index.js").DataViewWidgetProps, {}>;
    tools: {
        sort: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
        filter: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
        search: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
        viewOptions: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
        tableAddRow: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
    };
};
//# sourceMappingURL=index.d.ts.map