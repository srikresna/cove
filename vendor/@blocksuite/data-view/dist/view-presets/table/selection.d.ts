import { z } from 'zod';
export declare const TableViewTypeSchema: z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"table">;
}, "strip", z.ZodTypeAny, {
    type: "table";
    viewId: string;
}, {
    type: "table";
    viewId: string;
}>;
export declare const RangeSchema: z.ZodObject<{
    start: z.ZodNumber;
    end: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    start: number;
    end: number;
}, {
    start: number;
    end: number;
}>;
export declare const FocusSchema: z.ZodObject<{
    rowIndex: z.ZodNumber;
    columnIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    rowIndex: number;
    columnIndex: number;
}, {
    rowIndex: number;
    columnIndex: number;
}>;
export declare const TableViewAreaSelectionSchema: z.ZodObject<{
    selectionType: z.ZodLiteral<"area">;
    groupKey: z.ZodOptional<z.ZodString>;
    rowsSelection: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    columnsSelection: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    focus: z.ZodObject<{
        rowIndex: z.ZodNumber;
        columnIndex: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rowIndex: number;
        columnIndex: number;
    }, {
        rowIndex: number;
        columnIndex: number;
    }>;
    isEditing: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    focus: {
        rowIndex: number;
        columnIndex: number;
    };
    selectionType: "area";
    rowsSelection: {
        start: number;
        end: number;
    };
    columnsSelection: {
        start: number;
        end: number;
    };
    isEditing: boolean;
    groupKey?: string | undefined;
}, {
    focus: {
        rowIndex: number;
        columnIndex: number;
    };
    selectionType: "area";
    rowsSelection: {
        start: number;
        end: number;
    };
    columnsSelection: {
        start: number;
        end: number;
    };
    isEditing: boolean;
    groupKey?: string | undefined;
}>;
export declare const RowWithGroupSchema: z.ZodObject<{
    id: z.ZodString;
    groupKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    groupKey?: string | undefined;
}, {
    id: string;
    groupKey?: string | undefined;
}>;
export declare const TableViewRowSelectionSchema: z.ZodObject<{
    selectionType: z.ZodLiteral<"row">;
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        groupKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        groupKey?: string | undefined;
    }, {
        id: string;
        groupKey?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    selectionType: "row";
    rows: {
        id: string;
        groupKey?: string | undefined;
    }[];
}, {
    selectionType: "row";
    rows: {
        id: string;
        groupKey?: string | undefined;
    }[];
}>;
export declare const TableViewSelectionSchema: z.ZodUnion<[z.ZodObject<{
    selectionType: z.ZodLiteral<"area">;
    groupKey: z.ZodOptional<z.ZodString>;
    rowsSelection: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    columnsSelection: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    focus: z.ZodObject<{
        rowIndex: z.ZodNumber;
        columnIndex: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rowIndex: number;
        columnIndex: number;
    }, {
        rowIndex: number;
        columnIndex: number;
    }>;
    isEditing: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    focus: {
        rowIndex: number;
        columnIndex: number;
    };
    selectionType: "area";
    rowsSelection: {
        start: number;
        end: number;
    };
    columnsSelection: {
        start: number;
        end: number;
    };
    isEditing: boolean;
    groupKey?: string | undefined;
}, {
    focus: {
        rowIndex: number;
        columnIndex: number;
    };
    selectionType: "area";
    rowsSelection: {
        start: number;
        end: number;
    };
    columnsSelection: {
        start: number;
        end: number;
    };
    isEditing: boolean;
    groupKey?: string | undefined;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"row">;
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        groupKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        groupKey?: string | undefined;
    }, {
        id: string;
        groupKey?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    selectionType: "row";
    rows: {
        id: string;
        groupKey?: string | undefined;
    }[];
}, {
    selectionType: "row";
    rows: {
        id: string;
        groupKey?: string | undefined;
    }[];
}>]>;
export declare const TableViewSelectionWithTypeSchema: z.ZodUnion<[z.ZodIntersection<z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"table">;
}, "strip", z.ZodTypeAny, {
    type: "table";
    viewId: string;
}, {
    type: "table";
    viewId: string;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"area">;
    groupKey: z.ZodOptional<z.ZodString>;
    rowsSelection: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    columnsSelection: z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        start: number;
        end: number;
    }, {
        start: number;
        end: number;
    }>;
    focus: z.ZodObject<{
        rowIndex: z.ZodNumber;
        columnIndex: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        rowIndex: number;
        columnIndex: number;
    }, {
        rowIndex: number;
        columnIndex: number;
    }>;
    isEditing: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    focus: {
        rowIndex: number;
        columnIndex: number;
    };
    selectionType: "area";
    rowsSelection: {
        start: number;
        end: number;
    };
    columnsSelection: {
        start: number;
        end: number;
    };
    isEditing: boolean;
    groupKey?: string | undefined;
}, {
    focus: {
        rowIndex: number;
        columnIndex: number;
    };
    selectionType: "area";
    rowsSelection: {
        start: number;
        end: number;
    };
    columnsSelection: {
        start: number;
        end: number;
    };
    isEditing: boolean;
    groupKey?: string | undefined;
}>>, z.ZodIntersection<z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"table">;
}, "strip", z.ZodTypeAny, {
    type: "table";
    viewId: string;
}, {
    type: "table";
    viewId: string;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"row">;
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        groupKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        groupKey?: string | undefined;
    }, {
        id: string;
        groupKey?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    selectionType: "row";
    rows: {
        id: string;
        groupKey?: string | undefined;
    }[];
}, {
    selectionType: "row";
    rows: {
        id: string;
        groupKey?: string | undefined;
    }[];
}>>]>;
export type RowWithGroup = z.TypeOf<typeof RowWithGroupSchema>;
export declare const RowWithGroup: {
    equal(a?: RowWithGroup, b?: RowWithGroup): boolean;
};
export type TableViewRowSelection = z.TypeOf<typeof TableViewRowSelectionSchema>;
export declare const TableViewRowSelection: {
    rows: (selection?: TableViewSelection) => RowWithGroup[];
    rowsIds: (selection?: TableViewSelection) => string[];
    includes(selection: TableViewSelection | undefined, row: RowWithGroup): boolean;
    create(options: {
        rows: RowWithGroup[];
    }): TableViewRowSelection;
    is(selection?: TableViewSelection): selection is TableViewRowSelection;
};
export type TableViewAreaSelection = z.TypeOf<typeof TableViewAreaSelectionSchema>;
export declare const TableViewAreaSelection: {
    create: (options: {
        groupKey?: string;
        focus: CellFocus;
        rowsSelection?: MultiSelection;
        columnsSelection?: MultiSelection;
        isEditing: boolean;
    }) => TableViewAreaSelection;
    isFocus(selection: TableViewAreaSelection): boolean;
};
export type CellFocus = z.TypeOf<typeof FocusSchema>;
export type MultiSelection = z.TypeOf<typeof RangeSchema>;
export type TableViewSelection = z.TypeOf<typeof TableViewSelectionSchema>;
export type TableViewSelectionWithType = z.TypeOf<typeof TableViewSelectionWithTypeSchema>;
//# sourceMappingURL=selection.d.ts.map