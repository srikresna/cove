import type { BlockModel } from './block-model.js';
type PropsInDraft = 'version' | 'flavour' | 'role' | 'id' | 'keys' | 'text';
type ModelProps<Model> = Model extends BlockModel<infer U> ? U : never;
declare const draftModelSymbol: unique symbol;
export type DraftModel<Model extends BlockModel = BlockModel> = Pick<Model, PropsInDraft> & {
    children: DraftModel[];
    props: ModelProps<Model>;
    [draftModelSymbol]: true;
};
export declare function toDraftModel<Model extends BlockModel = BlockModel>(origin: Model): DraftModel<Model>;
export {};
//# sourceMappingURL=draft.d.ts.map