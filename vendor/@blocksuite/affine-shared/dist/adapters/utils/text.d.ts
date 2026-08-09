import type { ReferenceParams } from '@blocksuite/affine-model';
import type { DeltaInsert } from '@blocksuite/store';
declare function toURLSearchParams(params?: Partial<Record<string, string | string[]>>): URLSearchParams | undefined;
declare function generateDocUrl(docBaseUrl: string, pageId: string, params: ReferenceParams): string;
export declare const AdapterTextUtils: {
    mergeDeltas: (acc: DeltaInsert[], cur: DeltaInsert, options?: {
        force?: boolean;
    }) => DeltaInsert[];
    isNullish: (value: unknown) => value is null | undefined;
    createText: (s: string) => {
        '$blocksuite:internal:text$': boolean;
        delta: {
            insert: string;
        }[];
    };
    isText: (o: unknown) => boolean;
    toURLSearchParams: typeof toURLSearchParams;
    generateDocUrl: typeof generateDocUrl;
};
export {};
//# sourceMappingURL=text.d.ts.map