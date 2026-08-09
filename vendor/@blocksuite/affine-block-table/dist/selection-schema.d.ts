import { BaseSelection } from '@blocksuite/store';
import { z } from 'zod';
declare const TableAreaSelectionSchema: z.ZodObject<{
    type: z.ZodLiteral<"area">;
    rowStartIndex: z.ZodNumber;
    rowEndIndex: z.ZodNumber;
    columnStartIndex: z.ZodNumber;
    columnEndIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "area";
    rowStartIndex: number;
    rowEndIndex: number;
    columnStartIndex: number;
    columnEndIndex: number;
}, {
    type: "area";
    rowStartIndex: number;
    rowEndIndex: number;
    columnStartIndex: number;
    columnEndIndex: number;
}>;
export type TableAreaSelection = z.TypeOf<typeof TableAreaSelectionSchema>;
declare const TableSelectionDataSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"area">;
    rowStartIndex: z.ZodNumber;
    rowEndIndex: z.ZodNumber;
    columnStartIndex: z.ZodNumber;
    columnEndIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "area";
    rowStartIndex: number;
    rowEndIndex: number;
    columnStartIndex: number;
    columnEndIndex: number;
}, {
    type: "area";
    rowStartIndex: number;
    rowEndIndex: number;
    columnStartIndex: number;
    columnEndIndex: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"row">;
    rowId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "row";
    rowId: string;
}, {
    type: "row";
    rowId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"column">;
    columnId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "column";
    columnId: string;
}, {
    type: "column";
    columnId: string;
}>]>;
export type TableSelectionData = z.TypeOf<typeof TableSelectionDataSchema>;
export declare const TableSelectionData: {
    equals(a?: TableSelectionData, b?: TableSelectionData): boolean;
};
export declare class TableSelection extends BaseSelection {
    static group: string;
    static type: string;
    static recoverable: boolean;
    readonly data: TableSelectionData;
    constructor({ blockId, data, }: {
        blockId: string;
        data: TableSelectionData;
    });
    static fromJSON(json: Record<string, unknown>): TableSelection;
    equals(other: BaseSelection): boolean;
    toJSON(): Record<string, unknown>;
}
export declare const TableSelectionExtension: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=selection-schema.d.ts.map