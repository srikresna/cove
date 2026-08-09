import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../trait.js';
import type { GroupRenderProps } from '../types.js';
declare const BaseGroup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class BaseGroup<JsonValue, Data extends Record<string, unknown>> extends BaseGroup_base implements GroupRenderProps<JsonValue, Data> {
    accessor group: Group<unknown, JsonValue, Data>;
    accessor readonly: boolean;
    updateData(data: Data): void;
    updateValue(value: JsonValue): void;
    get value(): JsonValue;
    get type(): import("../../index.js").TypeInstance;
    get data(): Data;
}
export {};
//# sourceMappingURL=base.d.ts.map