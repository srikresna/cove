import { z } from 'zod';
export type DocMode = 'edgeless' | 'page';
export declare const DocModes: readonly ["edgeless", "page"];
export type FootNoteReferenceType = 'doc' | 'attachment' | 'url';
export declare const FootNoteReferenceTypes: readonly ["doc", "attachment", "url"];
/**
 * Custom title and description information.
 *
 * Supports the following blocks:
 *
 * 1. Inline View: `AffineReference` - title
 * 2. Card View: `EmbedLinkedDocBlock` - title & description
 * 3. Embed View: `EmbedSyncedDocBlock` - title
 */
export declare const AliasInfoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
}>;
export type AliasInfo = z.infer<typeof AliasInfoSchema>;
export declare const SerializedXYWHSchema: z.ZodType<`[${number},${number},${number},${number}]`, z.ZodTypeDef, `[${number},${number},${number},${number}]`>;
export declare const ReferenceParamsSchema: z.ZodObject<{
    mode: z.ZodOptional<z.ZodEnum<["edgeless", "page"]>>;
    blockIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    elementIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    databaseId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    databaseRowId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    xywh: z.ZodOptional<z.ZodOptional<z.ZodType<`[${number},${number},${number},${number}]`, z.ZodTypeDef, `[${number},${number},${number},${number}]`>>>;
    commentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    mode?: "edgeless" | "page" | undefined;
    blockIds?: string[] | undefined;
    elementIds?: string[] | undefined;
    databaseId?: string | undefined;
    databaseRowId?: string | undefined;
    xywh?: `[${number},${number},${number},${number}]` | undefined;
    commentId?: string | undefined;
}, {
    mode?: "edgeless" | "page" | undefined;
    blockIds?: string[] | undefined;
    elementIds?: string[] | undefined;
    databaseId?: string | undefined;
    databaseRowId?: string | undefined;
    xywh?: `[${number},${number},${number},${number}]` | undefined;
    commentId?: string | undefined;
}>;
export type ReferenceParams = z.infer<typeof ReferenceParamsSchema>;
export declare const ReferenceInfoSchema: z.ZodObject<{
    pageId: z.ZodString;
    params: z.ZodOptional<z.ZodObject<{
        mode: z.ZodOptional<z.ZodEnum<["edgeless", "page"]>>;
        blockIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        elementIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        databaseId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        databaseRowId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        xywh: z.ZodOptional<z.ZodOptional<z.ZodType<`[${number},${number},${number},${number}]`, z.ZodTypeDef, `[${number},${number},${number},${number}]`>>>;
        commentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        mode?: "edgeless" | "page" | undefined;
        blockIds?: string[] | undefined;
        elementIds?: string[] | undefined;
        databaseId?: string | undefined;
        databaseRowId?: string | undefined;
        xywh?: `[${number},${number},${number},${number}]` | undefined;
        commentId?: string | undefined;
    }, {
        mode?: "edgeless" | "page" | undefined;
        blockIds?: string[] | undefined;
        elementIds?: string[] | undefined;
        databaseId?: string | undefined;
        databaseRowId?: string | undefined;
        xywh?: `[${number},${number},${number},${number}]` | undefined;
        commentId?: string | undefined;
    }>>;
} & {
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pageId: string;
    title?: string | undefined;
    description?: string | undefined;
    params?: {
        mode?: "edgeless" | "page" | undefined;
        blockIds?: string[] | undefined;
        elementIds?: string[] | undefined;
        databaseId?: string | undefined;
        databaseRowId?: string | undefined;
        xywh?: `[${number},${number},${number},${number}]` | undefined;
        commentId?: string | undefined;
    } | undefined;
}, {
    pageId: string;
    title?: string | undefined;
    description?: string | undefined;
    params?: {
        mode?: "edgeless" | "page" | undefined;
        blockIds?: string[] | undefined;
        elementIds?: string[] | undefined;
        databaseId?: string | undefined;
        databaseRowId?: string | undefined;
        xywh?: `[${number},${number},${number},${number}]` | undefined;
        commentId?: string | undefined;
    } | undefined;
}>;
export type ReferenceInfo = z.infer<typeof ReferenceInfoSchema>;
/**
 * FootNoteReferenceParamsSchema is used to define the parameters for a footnote reference.
 * It supports the following types:
 * 1. docId: string - the id of the doc
 * 2. blobId: string - the id of the attachment
 * 3. url: string - the url of the reference
 * 4. fileName: string - the name of the attachment
 * 5. fileType: string - the type of the attachment
 * 6. favicon: string - the favicon of the url reference
 * 7. title: string - the title of the url reference
 * 8. description: string - the description of the url reference
 */
export declare const FootNoteReferenceParamsSchema: z.ZodObject<{
    type: z.ZodEnum<["doc", "attachment", "url"]>;
    docId: z.ZodOptional<z.ZodString>;
    blobId: z.ZodOptional<z.ZodString>;
    fileName: z.ZodOptional<z.ZodString>;
    fileType: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    favicon: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "doc" | "attachment" | "url";
    url?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    docId?: string | undefined;
    blobId?: string | undefined;
    fileName?: string | undefined;
    fileType?: string | undefined;
    favicon?: string | undefined;
}, {
    type: "doc" | "attachment" | "url";
    url?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    docId?: string | undefined;
    blobId?: string | undefined;
    fileName?: string | undefined;
    fileType?: string | undefined;
    favicon?: string | undefined;
}>;
export type FootNoteReferenceParams = z.infer<typeof FootNoteReferenceParamsSchema>;
export declare const FootNoteSchema: z.ZodObject<{
    label: z.ZodString;
    reference: z.ZodObject<{
        type: z.ZodEnum<["doc", "attachment", "url"]>;
        docId: z.ZodOptional<z.ZodString>;
        blobId: z.ZodOptional<z.ZodString>;
        fileName: z.ZodOptional<z.ZodString>;
        fileType: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        favicon: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "doc" | "attachment" | "url";
        url?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        docId?: string | undefined;
        blobId?: string | undefined;
        fileName?: string | undefined;
        fileType?: string | undefined;
        favicon?: string | undefined;
    }, {
        type: "doc" | "attachment" | "url";
        url?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        docId?: string | undefined;
        blobId?: string | undefined;
        fileName?: string | undefined;
        fileType?: string | undefined;
        favicon?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    label: string;
    reference: {
        type: "doc" | "attachment" | "url";
        url?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        docId?: string | undefined;
        blobId?: string | undefined;
        fileName?: string | undefined;
        fileType?: string | undefined;
        favicon?: string | undefined;
    };
}, {
    label: string;
    reference: {
        type: "doc" | "attachment" | "url";
        url?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        docId?: string | undefined;
        blobId?: string | undefined;
        fileName?: string | undefined;
        fileType?: string | undefined;
        favicon?: string | undefined;
    };
}>;
export type FootNote = z.infer<typeof FootNoteSchema>;
//# sourceMappingURL=doc.d.ts.map