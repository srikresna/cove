import { z } from 'zod';
import type { DocMeta, DocsPropertiesMeta } from '../extension';
import type { Store } from '../model';
export type BlockSnapshot = {
    type: 'block';
    id: string;
    flavour: string;
    version?: number;
    props: Record<string, unknown>;
    children: BlockSnapshot[];
};
export declare const BlockSnapshotSchema: z.ZodType<BlockSnapshot>;
export type SliceSnapshot = {
    type: 'slice';
    content: BlockSnapshot[];
    workspaceId: string;
    pageId: string;
};
export declare const SliceSnapshotSchema: z.ZodType<SliceSnapshot>;
export type CollectionInfoSnapshot = {
    id: string;
    type: 'info';
    properties: DocsPropertiesMeta;
};
export type DocSnapshot = {
    type: 'page';
    meta: DocMeta;
    blocks: BlockSnapshot;
};
export declare const DocSnapshotSchema: z.ZodType<DocSnapshot>;
export interface BlobCRUD {
    get: (key: string) => Promise<Blob | null> | Blob | null;
    set: (key: string, value: Blob) => Promise<string> | string;
    delete: (key: string) => Promise<void> | void;
    list: () => Promise<string[]> | string[];
}
export interface DocCRUD {
    create: (id: string) => Store;
    get: (id: string) => Store | null;
    delete: (id: string) => void;
}
//# sourceMappingURL=type.d.ts.map