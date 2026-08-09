import type { BlockModel, Store } from '@blocksuite/store';
type ConstructorType<U> = {
    new (): U;
};
type ModelList<T> = T extends Array<infer U> ? U extends ConstructorType<infer C> ? Array<C> : never : never;
export declare function matchModels<const Model extends ConstructorType<BlockModel>[], U extends ModelList<Model>[number] = ModelList<Model>[number]>(model: BlockModel | null | undefined, expected: Model): model is U;
export declare function isInsideBlockByFlavour(doc: Store, block: BlockModel | string, flavour: string): boolean;
export {};
//# sourceMappingURL=checker.d.ts.map