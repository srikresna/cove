import { BaseSelection } from '@blocksuite/store';
import z from 'zod';
declare const HighlightSelectionParamsSchema: z.ZodObject<{
    mode: z.ZodOptional<z.ZodEnum<["edgeless", "page"]>>;
    blockIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    elementIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    databaseId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    databaseRowId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    xywh: z.ZodOptional<z.ZodOptional<z.ZodType<`[${number},${number},${number},${number}]`, z.ZodTypeDef, `[${number},${number},${number},${number}]`>>>;
    commentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    highlight: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    xywh?: `[${number},${number},${number},${number}]` | undefined;
    mode?: "edgeless" | "page" | undefined;
    blockIds?: string[] | undefined;
    elementIds?: string[] | undefined;
    databaseId?: string | undefined;
    databaseRowId?: string | undefined;
    highlight?: boolean | undefined;
    commentId?: string | undefined;
}, {
    xywh?: `[${number},${number},${number},${number}]` | undefined;
    mode?: "edgeless" | "page" | undefined;
    blockIds?: string[] | undefined;
    elementIds?: string[] | undefined;
    databaseId?: string | undefined;
    databaseRowId?: string | undefined;
    highlight?: boolean | undefined;
    commentId?: string | undefined;
}>;
type HighlightSelectionParams = z.infer<typeof HighlightSelectionParamsSchema>;
export declare class HighlightSelection extends BaseSelection {
    static group: string;
    static type: string;
    readonly blockIds: string[];
    readonly elementIds: string[];
    readonly mode: 'page' | 'edgeless';
    readonly highlight: boolean;
    constructor({ mode, blockIds, elementIds, highlight, }: HighlightSelectionParams);
    static fromJSON(json: Record<string, unknown>): HighlightSelection;
    equals(other: HighlightSelection): boolean;
    toJSON(): Record<string, unknown>;
}
export declare const HighlightSelectionExtension: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=hightlight.d.ts.map