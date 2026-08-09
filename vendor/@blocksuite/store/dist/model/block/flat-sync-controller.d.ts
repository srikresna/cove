import * as Y from 'yjs';
import type { Schema } from '../../schema/schema.js';
import type { Store } from '../store/store.js';
import { BlockModel } from './block-model.js';
import type { YBlock } from './types.js';
export declare class FlatSyncController {
    readonly schema: Schema;
    readonly yBlock: YBlock;
    readonly doc?: Store | undefined;
    readonly onChange?: ((key: string, isLocal: boolean) => void) | undefined;
    private _reactive;
    readonly flavour: string;
    readonly id: string;
    readonly model: BlockModel;
    readonly version: number;
    readonly yChildren: Y.Array<string[]>;
    constructor(schema: Schema, yBlock: YBlock, doc?: Store | undefined, onChange?: ((key: string, isLocal: boolean) => void) | undefined);
    private _createModel;
    private _parseYBlock;
    get stash(): (prop: string) => void;
    get pop(): (prop: string) => void;
}
//# sourceMappingURL=flat-sync-controller.d.ts.map