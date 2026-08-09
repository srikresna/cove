import { type Signal } from '@preact/signals-core';
import { Subject } from 'rxjs';
import type { Text } from '../../reactive/index.js';
import type { Store } from '../store/store.js';
import type { YBlock } from './types.js';
import type { BlockSchemaType } from './zod.js';
type SignaledProps<Props> = Props & {
    [P in keyof Props & string as `${P}$`]: Signal<Props[P]>;
};
declare const modelLabel: unique symbol;
export declare class BlockModel<Props extends object = object> {
    private readonly _children;
    private _store;
    private readonly _childModels;
    private readonly _onCreated;
    private readonly _onDeleted;
    childMap: import("@preact/signals-core").ReadonlySignal<Map<string, number>>;
    created: Subject<void>;
    deleted: Subject<void>;
    id: string;
    schema: BlockSchemaType;
    isEmpty(): boolean;
    keys: string[];
    [modelLabel]: Props;
    pop: (prop: keyof Props & string) => void;
    propsUpdated: Subject<{
        key: string;
    }>;
    stash: (prop: keyof Props & string) => void;
    get text(): Text | undefined;
    set text(text: Text);
    yBlock: YBlock;
    _props: SignaledProps<Props>;
    get props(): SignaledProps<Props>;
    get flavour(): string;
    get version(): number;
    get children(): BlockModel<object>[];
    get store(): Store;
    set store(doc: Store);
    get parent(): BlockModel<object> | null;
    get role(): string;
    constructor();
    dispose(): void;
    firstChild(): BlockModel | null;
    lastChild(): BlockModel | null;
    [Symbol.dispose](): void;
}
export {};
//# sourceMappingURL=block-model.d.ts.map