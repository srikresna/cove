import type { Map as YMap, YMapEvent } from 'yjs';
import type { UnRecord } from '../types';
type YEventHandlerOptions = {
    event: YMapEvent<unknown>;
    yMap: YMap<unknown>;
    proxy: UnRecord;
    stashed: Set<string | number>;
    updateWithYjsSkip: (fn: () => void) => void;
    transform: (key: string, value: unknown, origin: unknown) => unknown;
    onChange?: (key: string, isAdd: boolean) => void;
};
export declare const getYEventHandler: (options: YEventHandlerOptions) => void;
export {};
//# sourceMappingURL=y-event-handler.d.ts.map