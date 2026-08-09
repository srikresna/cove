import type { Awareness } from 'y-protocols/awareness.js';
export interface UserInfo {
    name: string;
}
type UserSelection = Array<Record<string, unknown>>;
export type RawAwarenessState = {
    user?: UserInfo;
    color?: string;
    selectionV2: Record<string, UserSelection>;
};
export interface AwarenessEvent {
    id: number;
    type: 'add' | 'update' | 'remove';
    state?: RawAwarenessState;
}
export declare class AwarenessStore {
    readonly awareness: Awareness;
    constructor(awareness: Awareness);
    destroy(): void;
    getLocalSelection(selectionManagerId: string): ReadonlyArray<Record<string, unknown>>;
    getStates(): Map<number, RawAwarenessState>;
    getLocalState(): RawAwarenessState;
    setLocalState(state: RawAwarenessState): void;
    setLocalStateField<Field extends keyof RawAwarenessState>(field: Field, value: RawAwarenessState[Field]): void;
    setLocalSelection(selectionManagerId: string, selection: UserSelection): void;
}
export {};
//# sourceMappingURL=awareness.d.ts.map