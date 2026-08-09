import { z } from 'zod';
export declare const KanbanViewTypeSchema: z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"kanban">;
}, "strip", z.ZodTypeAny, {
    type: "kanban";
    viewId: string;
}, {
    type: "kanban";
    viewId: string;
}>;
export declare const KanbanCellSelectionSchema: z.ZodObject<{
    selectionType: z.ZodLiteral<"cell">;
    groupKey: z.ZodString;
    cardId: z.ZodString;
    columnId: z.ZodString;
    isEditing: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    selectionType: "cell";
    groupKey: string;
    isEditing: boolean;
    cardId: string;
    columnId: string;
}, {
    selectionType: "cell";
    groupKey: string;
    isEditing: boolean;
    cardId: string;
    columnId: string;
}>;
declare const KanbanCardSelectionCardSchema: z.ZodObject<{
    groupKey: z.ZodString;
    cardId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    groupKey: string;
    cardId: string;
}, {
    groupKey: string;
    cardId: string;
}>;
export declare const KanbanCardSelectionSchema: z.ZodObject<{
    selectionType: z.ZodLiteral<"card">;
    cards: z.ZodTuple<[z.ZodObject<{
        groupKey: z.ZodString;
        cardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupKey: string;
        cardId: string;
    }, {
        groupKey: string;
        cardId: string;
    }>], z.ZodObject<{
        groupKey: z.ZodString;
        cardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupKey: string;
        cardId: string;
    }, {
        groupKey: string;
        cardId: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    selectionType: "card";
    cards: [{
        groupKey: string;
        cardId: string;
    }, ...{
        groupKey: string;
        cardId: string;
    }[]];
}, {
    selectionType: "card";
    cards: [{
        groupKey: string;
        cardId: string;
    }, ...{
        groupKey: string;
        cardId: string;
    }[]];
}>;
export declare const KanbanGroupSelectionSchema: z.ZodObject<{
    selectionType: z.ZodLiteral<"group">;
    groupKeys: z.ZodTuple<[z.ZodString], z.ZodString>;
}, "strip", z.ZodTypeAny, {
    selectionType: "group";
    groupKeys: [string, ...string[]];
}, {
    selectionType: "group";
    groupKeys: [string, ...string[]];
}>;
export declare const KanbanViewSelectionSchema: z.ZodUnion<[z.ZodObject<{
    selectionType: z.ZodLiteral<"cell">;
    groupKey: z.ZodString;
    cardId: z.ZodString;
    columnId: z.ZodString;
    isEditing: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    selectionType: "cell";
    groupKey: string;
    isEditing: boolean;
    cardId: string;
    columnId: string;
}, {
    selectionType: "cell";
    groupKey: string;
    isEditing: boolean;
    cardId: string;
    columnId: string;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"card">;
    cards: z.ZodTuple<[z.ZodObject<{
        groupKey: z.ZodString;
        cardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupKey: string;
        cardId: string;
    }, {
        groupKey: string;
        cardId: string;
    }>], z.ZodObject<{
        groupKey: z.ZodString;
        cardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupKey: string;
        cardId: string;
    }, {
        groupKey: string;
        cardId: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    selectionType: "card";
    cards: [{
        groupKey: string;
        cardId: string;
    }, ...{
        groupKey: string;
        cardId: string;
    }[]];
}, {
    selectionType: "card";
    cards: [{
        groupKey: string;
        cardId: string;
    }, ...{
        groupKey: string;
        cardId: string;
    }[]];
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"group">;
    groupKeys: z.ZodTuple<[z.ZodString], z.ZodString>;
}, "strip", z.ZodTypeAny, {
    selectionType: "group";
    groupKeys: [string, ...string[]];
}, {
    selectionType: "group";
    groupKeys: [string, ...string[]];
}>]>;
export declare const KanbanViewSelectionWithTypeSchema: z.ZodUnion<[z.ZodIntersection<z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"kanban">;
}, "strip", z.ZodTypeAny, {
    type: "kanban";
    viewId: string;
}, {
    type: "kanban";
    viewId: string;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"cell">;
    groupKey: z.ZodString;
    cardId: z.ZodString;
    columnId: z.ZodString;
    isEditing: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    selectionType: "cell";
    groupKey: string;
    isEditing: boolean;
    cardId: string;
    columnId: string;
}, {
    selectionType: "cell";
    groupKey: string;
    isEditing: boolean;
    cardId: string;
    columnId: string;
}>>, z.ZodIntersection<z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"kanban">;
}, "strip", z.ZodTypeAny, {
    type: "kanban";
    viewId: string;
}, {
    type: "kanban";
    viewId: string;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"card">;
    cards: z.ZodTuple<[z.ZodObject<{
        groupKey: z.ZodString;
        cardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupKey: string;
        cardId: string;
    }, {
        groupKey: string;
        cardId: string;
    }>], z.ZodObject<{
        groupKey: z.ZodString;
        cardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupKey: string;
        cardId: string;
    }, {
        groupKey: string;
        cardId: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    selectionType: "card";
    cards: [{
        groupKey: string;
        cardId: string;
    }, ...{
        groupKey: string;
        cardId: string;
    }[]];
}, {
    selectionType: "card";
    cards: [{
        groupKey: string;
        cardId: string;
    }, ...{
        groupKey: string;
        cardId: string;
    }[]];
}>>, z.ZodIntersection<z.ZodObject<{
    viewId: z.ZodString;
    type: z.ZodLiteral<"kanban">;
}, "strip", z.ZodTypeAny, {
    type: "kanban";
    viewId: string;
}, {
    type: "kanban";
    viewId: string;
}>, z.ZodObject<{
    selectionType: z.ZodLiteral<"group">;
    groupKeys: z.ZodTuple<[z.ZodString], z.ZodString>;
}, "strip", z.ZodTypeAny, {
    selectionType: "group";
    groupKeys: [string, ...string[]];
}, {
    selectionType: "group";
    groupKeys: [string, ...string[]];
}>>]>;
export type KanbanCellSelection = z.TypeOf<typeof KanbanCellSelectionSchema>;
export type KanbanCardSelectionCard = z.TypeOf<typeof KanbanCardSelectionCardSchema>;
export type KanbanCardSelection = z.TypeOf<typeof KanbanCardSelectionSchema>;
export type KanbanGroupSelection = z.TypeOf<typeof KanbanGroupSelectionSchema>;
export type KanbanViewSelection = z.TypeOf<typeof KanbanViewSelectionSchema>;
export type KanbanViewSelectionWithType = z.TypeOf<typeof KanbanViewSelectionWithTypeSchema>;
export {};
//# sourceMappingURL=selection.d.ts.map