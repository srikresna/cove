import type { Schema } from '../../schema/index.js';
import type { Store } from '../store/store.js';
import type { BlockOptions, YBlock } from './types.js';
export type BlockViewType = 'bypass' | 'display' | 'hidden';
export declare class Block {
    readonly schema: Schema;
    readonly yBlock: YBlock;
    readonly doc?: Store | undefined;
    readonly options: BlockOptions;
    private readonly _syncController;
    blockViewType: BlockViewType;
    get flavour(): string;
    get id(): string;
    get model(): import("./block-model.js").BlockModel<object>;
    get pop(): ((prop: string) => void) | ((prop: string) => void);
    get stash(): ((prop: string) => void) | ((prop: string) => void);
    get version(): number;
    constructor(schema: Schema, yBlock: YBlock, doc?: Store | undefined, options?: BlockOptions);
}
//# sourceMappingURL=block.d.ts.map