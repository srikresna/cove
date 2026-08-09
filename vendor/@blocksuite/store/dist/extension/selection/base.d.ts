import type { SelectionConstructor } from './types';
export type BaseSelectionOptions = {
    blockId: string;
};
export declare abstract class BaseSelection {
    static readonly group: string;
    static readonly type: string;
    static readonly recoverable: boolean;
    readonly blockId: string;
    get group(): string;
    get type(): string;
    constructor({ blockId }: BaseSelectionOptions);
    static fromJSON(_: Record<string, unknown>): BaseSelection;
    abstract equals(other: BaseSelection): boolean;
    is<T extends SelectionConstructor>(type: T): this is T extends SelectionConstructor<infer U> ? U : never;
    abstract toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=base.d.ts.map