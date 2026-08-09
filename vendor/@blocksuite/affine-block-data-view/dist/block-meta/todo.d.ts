import { type ListBlockModel } from '@blocksuite/affine-model';
export declare const todoMeta: {
    addProperty: <Value>(property: {
        name: string;
        key: string;
        metaConfig: import("@blocksuite/data-view").PropertyMetaConfig<string, {}, Value, unknown>;
        getColumnData?: ((block: ListBlockModel) => {}) | undefined;
        setColumnData?: ((block: ListBlockModel, data: {}) => void) | undefined;
        get: (block: ListBlockModel) => Value;
        set?: ((block: ListBlockModel, value: Value) => void) | undefined;
        updated: (block: ListBlockModel, callback: () => void) => import("@blocksuite/global/disposable").DisposableMember;
    }) => void;
    selector: (block: import("@blocksuite/store").Block) => boolean;
    properties: {
        name: string;
        key: string;
        metaConfig: import("@blocksuite/data-view").PropertyMetaConfig<string, {}, unknown, unknown>;
        getColumnData?: ((block: import("@blocksuite/store").BlockModel<object>) => {}) | undefined;
        setColumnData?: ((block: import("@blocksuite/store").BlockModel<object>, data: {}) => void) | undefined;
        get: (block: import("@blocksuite/store").BlockModel<object>) => unknown;
        set?: ((block: import("@blocksuite/store").BlockModel<object>, value: unknown) => void) | undefined;
        updated: (block: import("@blocksuite/store").BlockModel<object>, callback: () => void) => import("@blocksuite/global/disposable").DisposableMember;
    }[];
};
//# sourceMappingURL=todo.d.ts.map